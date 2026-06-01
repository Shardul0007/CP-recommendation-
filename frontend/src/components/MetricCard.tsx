interface MetricCardProps {
  label: string;
  value: string | number;
  accent?: "pine" | "coral" | "ink";
}

const accentClasses = {
  pine: "border-pine/30 bg-pine/5 text-pine",
  coral: "border-coral/30 bg-coral/5 text-coral",
  ink: "border-ink/15 bg-white text-ink"
};

const MetricCard = ({ label, value, accent = "ink" }: MetricCardProps) => (
  <div className={`rounded-lg border p-4 shadow-sm ${accentClasses[accent]}`}>
    <p className="text-sm font-medium text-ink/60">{label}</p>
    <p className="mt-2 text-2xl font-semibold tracking-normal">{value}</p>
  </div>
);

export default MetricCard;
