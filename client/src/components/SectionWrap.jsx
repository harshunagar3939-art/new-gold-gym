import Ambient3DCanvas from "./Ambient3DCanvas";

export default function SectionWrap({ children, className = "", dumbbellPosition = "right", type3d = "dumbbell" }) {
  return (
    <div className={`section-wrap section-wrap--${dumbbellPosition} ${className}`}>
      <Ambient3DCanvas type={type3d} className="section-ambient-3d" />
      <div className="section-wrap-content">{children}</div>
    </div>
  );
}

