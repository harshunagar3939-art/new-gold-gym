import { useState, useRef, useEffect } from "react";
import useReveal from "../hooks/useReveal";

const GEAR_TYPES = [
  { id: "dumbbell", name: "3D PRO DUMBBELL", spec: "50 KG • Knurled Steel", desc: "Precision knurled solid steel bar with high-density polyurethane rubber weight heads." },
  { id: "kettlebell", name: "3D GOLD KETTLEBELL", spec: "32 KG • Calibrated Cast Iron", desc: "Competition standard bell with smooth handle finish and weight distribution." },
  { id: "plate", name: "3D OLYMPIC BUMPER DISC", spec: "25 KG • Molded Rubber & Brass", desc: "Low-bounce competition bumper disc engineered for heavy deadlifts and drops." },
  { id: "trophy", name: "3D CHAMPION CREST", spec: "VIP GOLD • Custom Engraved", desc: "Gold Gym elite athlete milestone badge awarded to top transformed members." },
];

const FINISHES = [
  { id: "gold", name: "Pure Gold", primary: "#f0c96b", secondary: "#c9a24b", accent: "#ffe8a3" },
  { id: "stealth", name: "Stealth Black", primary: "#404040", secondary: "#1a1a1a", accent: "#737373" },
  { id: "chrome", name: "Silver Chrome", primary: "#e6e6e6", secondary: "#999999", accent: "#ffffff" },
];

export default function GymGear3DShowcase() {
  const [headRef, headIn] = useReveal();
  const [selectedGear, setSelectedGear] = useState("dumbbell");
  const [finish, setFinish] = useState("gold");
  const [autoRotate, setAutoRotate] = useState(true);

  const canvasRef = useRef(null);
  const isDragging = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });
  const rotation = useRef({ x: 0.2, y: 0.5 });
  const targetRotation = useRef({ x: 0.2, y: 0.5 });

  // Handle Drag / Orbit
  const handleMouseDown = (e) => {
    isDragging.current = true;
    previousMousePosition.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    const deltaX = e.clientX - previousMousePosition.current.x;
    const deltaY = e.clientY - previousMousePosition.current.y;

    targetRotation.current.y += deltaX * 0.01;
    targetRotation.current.x += deltaY * 0.01;

    previousMousePosition.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;
    let time = 0;

    // Particles around 3D Gear
    const particles = Array.from({ length: 36 }, () => ({
      x: (Math.random() - 0.5) * 320,
      y: (Math.random() - 0.5) * 320,
      z: (Math.random() - 0.5) * 260,
      radius: Math.random() * 2.2 + 1,
      speed: Math.random() * 0.015 + 0.005,
      angle: Math.random() * Math.PI * 2,
    }));

    function render() {
      time += 0.02;

      if (autoRotate && !isDragging.current) {
        targetRotation.current.y += 0.008;
      }

      // Smooth rotation damping
      rotation.current.x += (targetRotation.current.x - rotation.current.x) * 0.1;
      rotation.current.y += (targetRotation.current.y - rotation.current.y) * 0.1;

      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;

      ctx.clearRect(0, 0, w, h);

      // Radial background glow matching current finish
      const selectedTheme = FINISHES.find((f) => f.id === finish) || FINISHES[0];
      const glow = ctx.createRadialGradient(cx, cy, 20, cx, cy, 220);
      glow.addColorStop(0, selectedTheme.primary + "33");
      glow.addColorStop(0.6, selectedTheme.secondary + "0d");
      glow.addColorStop(1, "rgba(10, 10, 11, 0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);

      // Render 3D Floating Particles
      particles.forEach((p) => {
        p.angle += p.speed;
        const pz = p.z * Math.cos(rotation.current.y) - p.x * Math.sin(rotation.current.y);
        const px = p.z * Math.sin(rotation.current.y) + p.x * Math.cos(rotation.current.y);
        const py = p.y + Math.sin(p.angle + time) * 10;

        const scale = 360 / (360 + pz);
        const screenX = cx + px * scale;
        const screenY = cy + py * scale;
        const alpha = Math.max(0.1, Math.min(0.85, (pz + 150) / 300));

        ctx.fillStyle = selectedTheme.primary;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(screenX, screenY, p.radius * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      // 3D Object Rendering Stage
      ctx.save();
      ctx.translate(cx, cy + Math.sin(time * 1.5) * 6);

      const rotX = rotation.current.x;
      const rotY = rotation.current.y;

      if (selectedGear === "dumbbell") {
        // --- 3D DUMBBELL RENDER ---
        const barLength = 220;
        const plateCount = 3;

        // Central Knurled Bar
        const barGrad = ctx.createLinearGradient(-barLength / 2, 0, barLength / 2, 0);
        barGrad.addColorStop(0, selectedTheme.secondary);
        barGrad.addColorStop(0.5, selectedTheme.accent);
        barGrad.addColorStop(1, selectedTheme.secondary);

        ctx.strokeStyle = barGrad;
        ctx.lineWidth = 14;
        ctx.beginPath();
        ctx.moveTo(-barLength / 2 * Math.cos(rotY), Math.sin(rotX) * 20);
        ctx.lineTo(barLength / 2 * Math.cos(rotY), -Math.sin(rotX) * 20);
        ctx.stroke();

        // Left & Right Weight Head Packs
        [-1, 1].forEach((side) => {
          for (let i = 0; i < plateCount; i++) {
            const size = 65 - i * 12;
            const offset = side * (45 + i * 22) * Math.cos(rotY);
            const offsetY = side * (45 + i * 22) * Math.sin(rotX) * 0.3;

            const pGrad = ctx.createRadialGradient(-10, -10, 5, 0, 0, size);
            pGrad.addColorStop(0, selectedTheme.accent);
            pGrad.addColorStop(0.4, selectedTheme.primary);
            pGrad.addColorStop(1, selectedTheme.secondary);

            ctx.fillStyle = pGrad;
            ctx.beginPath();
            ctx.ellipse(offset, offsetY, Math.max(8, Math.abs(size * Math.sin(rotY))), size, rotX, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "rgba(0,0,0,0.5)";
            ctx.lineWidth = 2;
            ctx.stroke();
          }
        });
      } else if (selectedGear === "kettlebell") {
        // --- 3D KETTLEBELL RENDER ---
        ctx.rotate(rotY);

        // Main sphere body
        const radius = 70;
        const bGrad = ctx.createRadialGradient(-20, -25, 5, 0, 10, radius);
        bGrad.addColorStop(0, selectedTheme.accent);
        bGrad.addColorStop(0.5, selectedTheme.primary);
        bGrad.addColorStop(1, selectedTheme.secondary);

        ctx.fillStyle = bGrad;
        ctx.beginPath();
        ctx.arc(0, 15, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = selectedTheme.accent;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Handle Horns
        ctx.lineWidth = 20;
        ctx.lineCap = "round";
        ctx.strokeStyle = selectedTheme.secondary;
        ctx.beginPath();
        ctx.moveTo(-48, -5);
        ctx.bezierCurveTo(-48, -70, 48, -70, 48, -5);
        ctx.stroke();

        // Center Weight Stamp
        ctx.fillStyle = "#111113";
        ctx.beginPath();
        ctx.arc(0, 15, 26, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = "900 12px 'Space Mono', monospace";
        ctx.fillStyle = selectedTheme.primary;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("32 KG", 0, 15);
      } else if (selectedGear === "plate") {
        // --- 3D OLYMPIC BUMPER PLATE ---
        const discR = 100;
        const tiltWidth = Math.max(20, Math.abs(discR * Math.cos(rotY)));

        ctx.save();
        ctx.rotate(rotX);

        const discGrad = ctx.createRadialGradient(-15, -20, 10, 0, 0, discR);
        discGrad.addColorStop(0, selectedTheme.accent);
        discGrad.addColorStop(0.4, selectedTheme.primary);
        discGrad.addColorStop(0.8, selectedTheme.secondary);
        discGrad.addColorStop(1, "#0a0a0c");

        ctx.fillStyle = discGrad;
        ctx.beginPath();
        ctx.ellipse(0, 0, tiltWidth, discR, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = selectedTheme.accent;
        ctx.lineWidth = 3;
        ctx.stroke();

        // Inner Brass Hub
        ctx.fillStyle = selectedTheme.accent;
        ctx.beginPath();
        ctx.ellipse(0, 0, tiltWidth * 0.3, discR * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Center Hole
        ctx.fillStyle = "#0a0a0c";
        ctx.beginPath();
        ctx.ellipse(0, 0, tiltWidth * 0.12, discR * 0.12, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      } else if (selectedGear === "trophy") {
        // --- 3D CHAMPION TROPHY CREST ---
        ctx.rotate(rotY * 0.6);

        // Shield Base
        const shieldGrad = ctx.createLinearGradient(0, -90, 0, 90);
        shieldGrad.addColorStop(0, selectedTheme.accent);
        shieldGrad.addColorStop(0.5, selectedTheme.primary);
        shieldGrad.addColorStop(1, selectedTheme.secondary);

        ctx.fillStyle = shieldGrad;
        ctx.beginPath();
        ctx.moveTo(0, -90);
        ctx.lineTo(65, -50);
        ctx.lineTo(55, 30);
        ctx.lineTo(0, 85);
        ctx.lineTo(-55, 30);
        ctx.lineTo(-65, -50);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Crown Star
        ctx.font = "bold 32px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#111113";
        ctx.fillText("🏆", 0, -10);

        ctx.font = "900 11px 'Space Mono', monospace";
        ctx.fillStyle = "#111113";
        ctx.fillText("NEW GOLD", 0, 35);
      }

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    }

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [selectedGear, finish, autoRotate]);

  const activeGearObj = GEAR_TYPES.find((g) => g.id === selectedGear) || GEAR_TYPES[0];

  return (
    <section className="gear-3d-section" id="3d-studio">
      <div className="wrap">
        <div className={`sec-head reveal ${headIn ? "in-view" : ""}`} ref={headRef}>
          <div>
            <div className="eyebrow">3D Interactive Gear Studio</div>
            <h2>
              Inspect Our
              <br />
              Heavy Iron
            </h2>
          </div>
          <p className="gear-head-desc">
            Explore 360° interactive 3D models of high-grade equipment engineered for extreme performance.
            Drag canvas to orbit, test finishes, and inspect specifications.
          </p>
        </div>

        <div className="gear-3d-layout">
          {/* Left Controls & Gear Selector */}
          <div className="gear-controls-col">
            <div className="control-label">SELECT EQUIPMENT MODEL</div>
            <div className="gear-btn-group">
              {GEAR_TYPES.map((g) => (
                <button
                  key={g.id}
                  className={`gear-select-btn ${selectedGear === g.id ? "active" : ""}`}
                  onClick={() => setSelectedGear(g.id)}
                >
                  <span className="gear-btn-dot"></span>
                  {g.name}
                </button>
              ))}
            </div>

            <div className="control-label" style={{ marginTop: 24 }}>
              SELECT MATERIAL FINISH
            </div>
            <div className="finish-btn-group">
              {FINISHES.map((f) => (
                <button
                  key={f.id}
                  className={`finish-btn ${finish === f.id ? "active" : ""}`}
                  onClick={() => setFinish(f.id)}
                  style={{ "--finish-color": f.primary }}
                >
                  <span className="finish-swatch" style={{ background: f.primary }}></span>
                  {f.name}
                </button>
              ))}
            </div>

            <div className="auto-rotate-toggle">
              <label>
                <input
                  type="checkbox"
                  checked={autoRotate}
                  onChange={(e) => setAutoRotate(e.target.checked)}
                />
                Auto 360° Orbit Rotation
              </label>
            </div>
          </div>

          {/* Center 3D Interactive Canvas */}
          <div className="gear-canvas-wrap">
            <canvas
              ref={canvasRef}
              width={460}
              height={440}
              className="gear-canvas"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />
            <div className="canvas-instruction-badge">
              <span>🖱️ Drag to rotate 360°</span>
            </div>
          </div>

          {/* Right Live Specs Panel */}
          <div className="gear-specs-col">
            <div className="specs-card">
              <div className="specs-tag">LIVE SPECIFICATION SHEET</div>
              <h3>{activeGearObj.name}</h3>
              <div className="specs-main-val">{activeGearObj.spec}</div>
              <p className="specs-desc">{activeGearObj.desc}</p>

              <div className="specs-list">
                <div className="spec-row">
                  <span>Grade Standard</span>
                  <strong>Olympic Competition</strong>
                </div>
                <div className="spec-row">
                  <span>Calibration Tolerance</span>
                  <strong>± 0.05% Precision</strong>
                </div>
                <div className="spec-row">
                  <span>Coating Technology</span>
                  <strong>Dual Ion PVD Titanium</strong>
                </div>
              </div>

              <a href="#contact" className="btn-primary specs-cta">
                Test Equipment In Gym →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
