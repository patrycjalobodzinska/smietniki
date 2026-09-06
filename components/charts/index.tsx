"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

/**
 * Chart primitives for SMART WASTE. Colors reference design tokens via CSS
 * variables (var(--color-chart-*)), so every chart adapts to dark/light
 * automatically - no per-theme chart code.
 */

const AXIS = "var(--color-muted-foreground)";
const GRID = "var(--color-border)";
const SERIES = ["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-3)", "var(--color-chart-4)", "var(--color-chart-5)", "var(--color-chart-6)"];

const tooltipStyle = {
  background: "var(--color-popover)",
  border: "1px solid var(--color-border)",
  borderRadius: 10,
  fontSize: 12,
  color: "var(--color-popover-foreground)",
} as const;

const axisProps = { stroke: AXIS, fontSize: 11, tickLine: false, axisLine: false } as const;

/**
 * Recharts mierzy szerokość raz i nie kurczy się poniżej zmierzonej wartości,
 * więc w komórce siatki (domyślne `min-width: auto`) rozpycha całą kolumnę -
 * na telefonie widać to jako poziome przewijanie strony. `min-w-0` pozwala
 * komórce się zwężyć, `overflow-hidden` ucina resztę zanim urośnie layout.
 */
function ChartBox({ children }: { children: React.ReactNode }) {
  return <div className="w-full min-w-0 overflow-hidden">{children}</div>;
}

export interface Point {
  label: string;
  value: number;
}

/**
 * Nazwa serii w tooltipie. Recharts bez `name` pokazuje surowy `dataKey`,
 * czyli angielskie "value" - stąd polski domyślny podpis.
 */
const DEFAULT_SERIES = "Wartość";

export function TrendLineChart({
  data,
  height = 220,
  max = 100,
  seriesLabel = DEFAULT_SERIES,
}: {
  data: Point[];
  height?: number;
  max?: number;
  seriesLabel?: string;
}) {
  return (
    <ChartBox>
      <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
        <XAxis dataKey="label" {...axisProps} />
        <YAxis domain={[0, max]} {...axisProps} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: GRID }} />
        <Line
          type="monotone"
          name={seriesLabel}
          dataKey="value"
          stroke="var(--color-chart-1)"
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 4 }}
        />
      </LineChart>
      </ResponsiveContainer>
    </ChartBox>
  );
}

export function DailyBarChart({
  data,
  height = 220,
  seriesLabel = DEFAULT_SERIES,
}: {
  data: Point[];
  height?: number;
  seriesLabel?: string;
}) {
  return (
    <ChartBox>
      <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
        <XAxis dataKey="label" {...axisProps} />
        <YAxis {...axisProps} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--color-surface-hover)" }} />
        <Bar name={seriesLabel} dataKey="value" fill="var(--color-chart-2)" radius={[4, 4, 0, 0]} maxBarSize={28} />
      </BarChart>
      </ResponsiveContainer>
    </ChartBox>
  );
}

export function HBarChart({
  data,
  height = 220,
  seriesLabel = DEFAULT_SERIES,
}: {
  data: Point[];
  height?: number;
  seriesLabel?: string;
}) {
  return (
    <ChartBox>
      <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 12, bottom: 0, left: 12 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} horizontal={false} />
        <XAxis type="number" domain={[0, 100]} {...axisProps} />
        <YAxis type="category" dataKey="label" width={72} {...axisProps} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--color-surface-hover)" }} />
        <Bar name={seriesLabel} dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={22}>
          {data.map((_, i) => (
            <Cell key={i} fill={SERIES[i % SERIES.length]} />
          ))}
        </Bar>
      </BarChart>
      </ResponsiveContainer>
    </ChartBox>
  );
}

export interface GroupedPoint {
  label: string;
  a: number;
  b: number;
}

export function GroupedBarChart({
  data,
  aLabel,
  bLabel,
  height = 260,
}: {
  data: GroupedPoint[];
  aLabel: string;
  bLabel: string;
  height?: number;
}) {
  return (
    <ChartBox>
      <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
        <XAxis dataKey="label" {...axisProps} />
        <YAxis {...axisProps} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--color-surface-hover)" }} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: "var(--color-muted-foreground)" }} />
        <Bar name={aLabel} dataKey="a" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} maxBarSize={26} />
        <Bar name={bLabel} dataKey="b" fill="var(--color-chart-3)" radius={[4, 4, 0, 0]} maxBarSize={26} />
      </BarChart>
      </ResponsiveContainer>
    </ChartBox>
  );
}

export interface Slice {
  label: string;
  value: number;
  color: string;
}

export function DonutChart({ data, height = 220 }: { data: Slice[]; height?: number }) {
  return (
    <ChartBox>
      <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="label"
          innerRadius="58%"
          outerRadius="82%"
          paddingAngle={2}
          stroke="var(--color-card)"
          strokeWidth={2}
        >
          {data.map((s, i) => (
            <Cell key={i} fill={s.color} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 12, color: "var(--color-muted-foreground)" }}
        />
      </PieChart>
      </ResponsiveContainer>
    </ChartBox>
  );
}
