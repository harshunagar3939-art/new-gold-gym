import DumbbellRig from "./DumbbellRig";

export default function AmbientDumbbell({ variant = "full", className = "" }) {
  const isMini = variant === "mini";
  const isSection = variant === "section";

  return (
    <div
      className={`ambient-dumbbell ambient-dumbbell--${variant} ${className}`}
      aria-hidden="true"
    >
      <div className="ambient-dumbbell-inner">
        <DumbbellRig
          scale={isMini ? 0.35 : isSection ? 0.55 : 0.85}
          barWidth={isMini ? 280 : isSection ? 420 : 640}
          loaded={false}
          className="ambient-rig"
        />
      </div>
    </div>
  );
}
