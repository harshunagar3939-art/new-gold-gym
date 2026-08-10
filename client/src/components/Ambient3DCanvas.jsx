import { useEffect, useRef } from "react";
import AmbientDumbbell from "./AmbientDumbbell";

export default function Ambient3DCanvas({ type = "dumbbell", className = "" }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (type === "dumbbell") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationId;
    let time = 0;

    const mouse = { x: 0, y: 0 };
    function handleMouseMove(e) {
      const rect = canvas.getBoundingClientRect();
      mouse.x = (e.clientX - rect.left - rect.width / 2) * 0.002;
      mouse.y = (e.clientY - rect.top - rect.height / 2) * 0.002;
    }
    window.addEventListener("mousemove", handleMouseMove);

    function draw() {
      time += 0.025;
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;

      ctx.clearRect(0, 0, w, h);

      ctx.save();
      ctx.translate(cx, cy);

      const rx = mouse.y * 0.8;
      const ry = mouse.x * 0.8 + time * 0.4;

      if (type === "stats") {
        // --- 3D WEIGHT STACK & ENERGY RINGS ---
        ctx.rotate(ry * 0.5);

        // Stack plates
        for (let i = -3; i <= 3; i++) {
          const yOffset = i * 22;
          const radius = 95 - Math.abs(i) * 10;
          const tilt = Math.max(12, Math.abs(radius * Math.cos(ry)));

          const grad = ctx.createRadialGradient(-10, yOffset - 10, 5, 0, yOffset, radius);
          grad.addColorStop(0, "#ffe8a3");
          grad.addColorStop(0.5, "#f0c96b");
          grad.addColorStop(1, "#261d0b");

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.ellipse(0, yOffset, tilt, radius * 0.35, rx, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "rgba(240, 201, 107, 0.4)";
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        // Energy rings
        ctx.strokeStyle = "rgba(255, 235, 170, 0.7)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(0, 0, 130, 45, time * 0.6, 0, Math.PI * 2);
        ctx.stroke();
      } else if (type === "programs") {
        // --- 3D HEXAGON WIREFRAME CUBE / WEIGHT DISC ---
        ctx.rotate(ry);

        const hexR = 85;
        ctx.strokeStyle = "#f0c96b";
        ctx.lineWidth = 2.5;

        // Draw 3D wireframe hexagon
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI) / 3;
          const x = hexR * Math.cos(angle);
          const y = hexR * Math.sin(angle) * Math.cos(rx);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();

        // Inner glowing core
        const coreGlow = ctx.createRadialGradient(0, 0, 2, 0, 0, 45);
        coreGlow.addColorStop(0, "rgba(240, 201, 107, 0.8)");
        coreGlow.addColorStop(1, "rgba(240, 201, 107, 0)");
        ctx.fillStyle = coreGlow;
        ctx.beginPath();
        ctx.arc(0, 0, 45, 0, Math.PI * 2);
        ctx.fill();
      } else if (type === "pricing") {
        // --- 3D VIP GOLD MEMBERSHIP CARD ---
        ctx.rotate(ry * 0.4);

        const cardW = 180;
        const cardH = 110;

        // Card body with 3D metallic gradient
        const cardGrad = ctx.createLinearGradient(-cardW / 2, -cardH / 2, cardW / 2, cardH / 2);
        cardGrad.addColorStop(0, "#ffe8a3");
        cardGrad.addColorStop(0.3, "#f0c96b");
        cardGrad.addColorStop(0.7, "#c9a24b");
        cardGrad.addColorStop(1, "#1c170d");

        ctx.fillStyle = cardGrad;
        ctx.beginPath();
        ctx.roundRect(-cardW / 2, -cardH / 2, cardW, cardH, 12);
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Card Hologram Emblem
        ctx.fillStyle = "#111113";
        ctx.beginPath();
        ctx.arc(-cardW / 2 + 35, -cardH / 2 + 35, 16, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = "bold 10px 'Space Mono', monospace";
        ctx.fillStyle = "#f0c96b";
        ctx.fillText("GOLD VIP", -cardW / 2 + 25, cardH / 2 - 20);
      } else if (type === "trainers") {
        // --- 3D HOLOGRAPHIC COACH BADGE ---
        ctx.rotate(ry * 0.5);

        const shieldR = 75;
        const shieldGrad = ctx.createRadialGradient(-10, -10, 5, 0, 0, shieldR);
        shieldGrad.addColorStop(0, "rgba(240, 201, 107, 0.4)");
        shieldGrad.addColorStop(0.6, "rgba(201, 162, 75, 0.15)");
        shieldGrad.addColorStop(1, "rgba(10, 10, 11, 0)");

        ctx.fillStyle = shieldGrad;
        ctx.beginPath();
        ctx.arc(0, 0, shieldR, 0, Math.PI * 2);
        ctx.fill();

        // Concentric Hologram Rings
        [40, 60, 80].forEach((r, idx) => {
          ctx.strokeStyle = `rgba(240, 201, 107, ${0.8 - idx * 0.25})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(0, 0, r, r * 0.4, time * (idx % 2 === 0 ? 1 : -1), 0, Math.PI * 2);
          ctx.stroke();
        });
      }

      ctx.restore();

      animationId = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, [type]);

  if (type === "dumbbell") {
    return <AmbientDumbbell variant="section" className={className} />;
  }

  return (
    <div className={`ambient-3d-wrap ${className}`} aria-hidden="true">
      <canvas ref={canvasRef} width={340} height={340} className="ambient-3d-canvas" />
    </div>
  );
}
