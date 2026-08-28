"use client";

/* Applies the store's theme + skin to <html> as data attributes, which is
   what globals.css keys every token off. One effect, no render output. */
import { useEffect } from "react";
import { useStore } from "@/lib/store";

export function ChromeController() {
  const { theme, skin } = useStore().state.profile;
  useEffect(() => {
    const el = document.documentElement;
    el.dataset.theme = theme;
    el.dataset.skin = skin;
  }, [theme, skin]);
  return null;
}
