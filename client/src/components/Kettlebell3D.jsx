import { useEffect, useRef } from "react";

export default function Kettlebell3D() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    let targetRotationX = 0;
    let targetRotationY = 0;
    let currentRotationX = 0;
    let currentRotationY = 0;

    function handleMouseMove(e) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      targetRotationY = (x / rect.width) * 0.8;
      targetRotationX = -(y / rect.height) * 0.8;
    }

    window.addEventListener("mousemove", handleMouseMove);

    // Particles around kettlebell
    const particles = Array.from({ length: 28 }, () => ({
      x: (Math.random() - 0.5) * 240,
      y: (Math.random() - 0.5) * 240,
      z: (Math.random() - 0.5) * 200,
      radius: Math.random() * 2.5 + 1,
      speed: Math.random() * 0.02 + 0.005,
      angle: Math.random() * Math.PI * 2,
    }));

    let time = 0;

    function render() {
      time += 0.02;
      currentRotationX += (targetRotationX - currentRotationX) * 0.08;
      currentRotationY += (targetRotationY - currentRotationY) * 0.08;

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      // Glow backdrop behind 3D Object
      const ambientGlow = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, 160);
      ambientGlow.addColorStop(0, "rgba(240, 201, 107, 0.25)");
      ambientGlow.addColorStop(0.5, "rgba(201, 162, 75, 0.08)");
      ambientGlow.addColorStop(1, "rgba(10, 10, 11, 0)");
      ctx.fillStyle = ambientGlow;
      ctx.fillRect(0, 0, width, height);

      // Render 3D Floating Particles
      particles.forEach((p) => {
        p.angle += p.speed;
        const pz = p.z * Math.cos(currentRotationY) - p.x * Math.sin(currentRotationY);
        const px = p.z * Math.sin(currentRotationY) + p.x * Math.cos(currentRotationY);
        const py = p.y + Math.sin(p.angle + time) * 12;

        const scale = 300 / (300 + pz);
        const screenX = centerX + px * scale;
        const screenY = centerY + py * scale;
        const alpha = Math.max(0.1, Math.min(0.9, (pz + 120) / 240));

        ctx.fillStyle = `rgba(240, 201, 107, ${alpha})`;
        ctx.beginPath();
        ctx.arc(screenX, screenY, p.radius * scale, 0, Math.PI * 2);
        ctx.fill();
      });

      // Render 3D Kettlebell Object using layered canvas 3D projection
      ctx.save();
      ctx.translate(centerX, centerY + Math.sin(time * 1.5) * 8);
      ctx.rotate(currentRotationY + time * 0.3);

      // 1. Kettlebell Main Body Sphere
      const bodyRadius = 64;
      const bodyGlow = ctx.createRadialGradient(-18, -22, 5, 0, 0, bodyRadius);
      bodyGlow.addColorStop(0, "#ffe8a3");
      bodyGlow.addColorStop(0.3, "#f0c96b");
      bodyGlow.addColorStop(0.7, "#c9a24b");
      bodyGlow.addColorStop(1, "#3d2e0f");

      ctx.fillStyle = bodyGlow;
      ctx.beginPath();
      ctx.arc(0, 20, bodyRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 235, 170, 0.6)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // 2. Weight Label "32 KG" / Gold Emblem
      ctx.fillStyle = "#1a160d";
      ctx.beginPath();
      ctx.arc(0, 20, 24, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = "bold 13px 'Space Mono', monospace";
      ctx.fillStyle = "#f0c96b";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("32 KG", 0, 20);

      // 3. Kettlebell Handle (Arc / Horns)
      ctx.lineWidth = 18;
      ctx.lineCap = "round";

      const handleGradient = ctx.createLinearGradient(-50, -60, 50, 20);
      handleGradient.addColorStop(0, "#8a8a8a");
      handleGradient.addColorStop(0.3, "#e6e6e6");
      handleGradient.addColorStop(0.7, "#737373");
      handleGradient.addColorStop(1, "#333333");

      ctx.strokeStyle = handleGradient;
      ctx.beginPath();
      ctx.moveTo(-44, 0);
      ctx.bezierCurveTo(-44, -58, 44, -58, 44, 0);
      ctx.stroke();

      // Inner handle shadow/cutout line
      ctx.lineWidth = 4;
      ctx.strokeStyle = "rgba(0, 0, 0, 0.4)";
      ctx.beginPath();
      ctx.moveTo(-36, -2);
      ctx.bezierCurveTo(-36, -50, 36, -50, 36, -2);
      ctx.stroke();

      // 4. Orbiting Weight Ring
      ctx.lineWidth = 3;
      ctx.strokeStyle = "rgba(240, 201, 107, 0.4)";
      ctx.beginPath();
      ctx.ellipse(0, 20, 95, 32, time * 0.8, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    }

    render();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="kettlebell-3d-wrap">
      <canvas ref={canvasRef} width={380} height={380} className="kettlebell-canvas" />
      <div className="kettlebell-label">3D HEAVY IRON • 32KG KETTLEBELL</div>
    </div>
  );
}
