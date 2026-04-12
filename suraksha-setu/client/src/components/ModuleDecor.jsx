export default function ModuleDecor({ variant = "blue" }) {
  return (
    <div className={`moduleDecor ${variant === "pink" ? "pink" : ""}`} aria-hidden="true">
      <div className="mdGlow" />
      <div className="mdItem md1">
        <div className="mdIcon" />
      </div>
      <div className="mdItem md2">
        <div className="mdIcon" />
      </div>
      <div className="mdItem md3">
        <div className="mdIcon" />
      </div>
    </div>
  );
}

