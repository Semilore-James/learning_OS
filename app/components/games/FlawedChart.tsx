"use client";

/* ============================================================================
   Renders the chart for a Chart Critiquer round with Recharts, so the flaw (or
   the absence of one) is actually visible instead of described. The chart is
   drawn as honestly as the round's `chart` type allows; the judgment happens
   in the questions, not in a caption.
   ========================================================================== */
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { CritiqueRound } from "@/lib/games/miniGames";

const PIE_COLORS = [
  "var(--primary)", "var(--accent-2)", "var(--accent-1)", "var(--accent-3)",
  "#e5484d", "#f5a623", "#4cc9f0", "#b298dc", "#57cc99", "#ff9770", "#9b5de5", "#f15bb5",
];

const axis = { stroke: "var(--text-muted)", fontSize: 10 };
const grid = { stroke: "var(--border)" };

export function FlawedChart({ round }: { round: CritiqueRound }) {
  const data = round.series.map((s, i) => ({
    label: s.label,
    value: s.value,
    value2: round.series2?.[i]?.value,
  }));

  if (round.chart === "pie") {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="label" outerRadius="80%" isAnimationActive={false}>
            {data.map((_, i) => (
              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
            ))}
          </Pie>
          <Legend wrapperStyle={{ fontSize: 9 }} />
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  if (round.chart === "line" || round.chart === "line-smooth") {
    const smooth = round.chart === "line-smooth";
    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 10, bottom: 4, left: -18 }}>
          <CartesianGrid {...grid} vertical={false} />
          <XAxis dataKey="label" {...axis} />
          <YAxis {...axis} domain={[round.yStart, "auto"]} allowDataOverflow />
          <Line
            type={smooth ? "monotone" : "linear"}
            dataKey="value"
            stroke="var(--primary)"
            strokeWidth={2}
            dot={!smooth}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  if (round.chart === "dual") {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 6, bottom: 4, left: -18 }}>
          <CartesianGrid {...grid} vertical={false} />
          <XAxis dataKey="label" {...axis} />
          <YAxis yAxisId="l" {...axis} domain={["dataMin - 5", "dataMax + 5"]} hide />
          <YAxis yAxisId="r" orientation="right" {...axis} domain={["dataMin - 200", "dataMax + 200"]} hide />
          <Line yAxisId="l" type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={2} dot={false} isAnimationActive={false} />
          <Line yAxisId="r" type="monotone" dataKey="value2" stroke="var(--accent-1)" strokeWidth={2} dot={false} isAnimationActive={false} />
          <Legend wrapperStyle={{ fontSize: 9 }} />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  // bar
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 10, bottom: 4, left: -18 }}>
        <CartesianGrid {...grid} vertical={false} />
        <XAxis dataKey="label" {...axis} />
        <YAxis {...axis} domain={[round.yStart, "auto"]} allowDataOverflow />
        <Bar dataKey="value" fill="var(--primary)" isAnimationActive={false} radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
