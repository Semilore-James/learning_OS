/* ============================================================================
   Shrink a screenshot before it goes to the PM's vision model: cap the long
   edge, re-encode as JPEG, return a data: URL. Keeps the request small and the
   token cost down. Runs entirely in the browser; the image is sent inline in
   the chat request, never uploaded to storage.
   ========================================================================== */
const MAX_EDGE = 1600;
const MAX_BYTES = 1_400_000; // ~1 KB of base64 per ~750 bytes; keep well under body limits

export async function downscaleImage(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no 2d context");
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  // step quality down until it fits
  for (const q of [0.82, 0.7, 0.55, 0.4]) {
    const url = canvas.toDataURL("image/jpeg", q);
    if (url.length <= MAX_BYTES) return url;
  }
  return canvas.toDataURL("image/jpeg", 0.3);
}
