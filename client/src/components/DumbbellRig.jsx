const PLATES = [
  { h: 100, w: 16 },
  { h: 140, w: 20 },
  { h: 175, w: 24 },
  { h: 200, w: 28 },
];

export default function DumbbellRig({
  scale = 1,
  barWidth = 640,
  loaded = true,
  scrollPlates = null,
  className = "",
  style = {},
  plates = PLATES,
}) {
  function platePositions(side) {
    return plates.map((plate, i) => {
      const restingGap = 6 + plates.slice(0, i).reduce((sum, p) => sum + p.w + 4, 0);
      const x = side * (26 + restingGap);
      return { ...plate, x, opacity: 1, key: `${side}-${i}` };
    });
  }

  const leftPlates = scrollPlates?.left || platePositions(-1);
  const rightPlates = scrollPlates?.right || platePositions(1);
  const isScroll = Boolean(scrollPlates);

  return (
    <div className={`dumbbell-rig ${className}`} style={{ transform: `scale(${scale})`, ...style }}>
      <div className="bar-track" style={{ position: "relative", height: 220 }}>
        <div
          className="bar-rod"
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: barWidth,
            height: 14,
            transform: "translate(-50%, -50%)",
          }}
        />
        {leftPlates.map((p) => (
          <div
            key={p.key}
            className={`plate ${isScroll ? "" : loaded ? "plate-loaded" : "plate-ambient-left"}`}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: p.w,
              height: p.h,
              transform: `translate(calc(-50% + ${p.x}px), -50%)`,
              opacity: p.opacity ?? 1,
              animationDelay: `${parseInt(p.key.split("-")[1], 10) * 0.15}s`,
            }}
          />
        ))}
        {rightPlates.map((p) => (
          <div
            key={p.key}
            className={`plate ${isScroll ? "" : loaded ? "plate-loaded" : "plate-ambient-right"}`}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: p.w,
              height: p.h,
              transform: `translate(calc(-50% + ${p.x}px), -50%)`,
              opacity: p.opacity ?? 1,
              animationDelay: `${parseInt(p.key.split("-")[1], 10) * 0.15}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export { PLATES };
