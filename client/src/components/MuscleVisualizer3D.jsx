import { useState, useRef, useEffect } from "react";
import useReveal from "../hooks/useReveal";

const MUSCLE_GROUPS = [
  {
    id: "chest",
    name: "CHEST",
    fullName: "Pectoralis Major & Minor",
    icon: "🏋️‍♂️",
    color: "#f0c96b",
    view: "front",
    coords: { x: 0, y: -42, r: 40 },
    camera: { scale: 1.65, x: 0, y: 70 },
    exercises: [
      { title: "Barbell Incline Bench Press", detail: "Upper chest focus • 4 Sets x 8-10 Reps" },
      { title: "Heavy Dumbbell Flat Flyes", detail: "Deep chest stretch • 3 Sets x 12 Reps" },
      { title: "Weighted Bodyweight Dips", detail: "Lower chest cut • 3 Sets x 10 Reps" },
    ],
    gear: "Olympic Barbell & Adjustable Bench",
    goal: "Hypertrophy & Pushing Power",
  },
  {
    id: "back",
    name: "BACK",
    fullName: "Latissimus Dorsi & Trapezius",
    icon: "🦅",
    color: "#e6b042",
    view: "back",
    coords: { x: 0, y: -30, r: 48 },
    camera: { scale: 1.65, x: 0, y: 55 },
    exercises: [
      { title: "Barbell Deadlift", detail: "Full posterior chain • 5 Sets x 5 Reps" },
      { title: "Wide Grip Lat Pulldown", detail: "V-Taper width • 4 Sets x 10 Reps" },
      { title: "Bent-Over Barbell Row", detail: "Mid-back thickness • 4 Sets x 8 Reps" },
    ],
    gear: "Deadlift Platform & Lat Cable Station",
    goal: "V-Taper Width & Pulling Strength",
  },
  {
    id: "arms",
    name: "ARMS",
    fullName: "Biceps Brachii & Triceps",
    icon: "💪",
    color: "#ffd580",
    view: "front",
    coords: { x: -55, y: -25, r: 30 },
    camera: { scale: 1.7, x: 65, y: 45 },
    exercises: [
      { title: "EZ-Bar Preacher Curls", detail: "Bicep peak isolation • 4 Sets x 12 Reps" },
      { title: "Heavy Tricep Skull Crushers", detail: "Tricep long head • 4 Sets x 10 Reps" },
      { title: "Incline Hammer Curls", detail: "Brachialis thickness • 3 Sets x 12 Reps" },
    ],
    gear: "EZ-Bar, Dumbbells & Cable Tower",
    goal: "Arm Peak & Horseshoe Triceps",
  },
  {
    id: "shoulders",
    name: "SHOULDERS",
    fullName: "Anterior, Lateral & Posterior Deltoids",
    icon: "🛡️",
    color: "#f7b731",
    view: "front",
    coords: { x: -46, y: -68, r: 32 },
    camera: { scale: 1.7, x: 0, y: 100 },
    exercises: [
      { title: "Overhead Military Press", detail: "3D Deltoid foundation • 4 Sets x 6 Reps" },
      { title: "Dumbbell Lateral Raises", detail: "Side delt cap width • 4 Sets x 15 Reps" },
      { title: "Face Pulls on Cable", detail: "Rear delt & cuff stability • 3 Sets x 15 Reps" },
    ],
    gear: "Power Rack & Heavy Dumbbell Rack",
    goal: "3D Cannonball Deltoids",
  },
  {
    id: "legs",
    name: "LEGS",
    fullName: "Quadriceps, Hamstrings & Glutes",
    icon: "🦵",
    color: "#fa8231",
    view: "front",
    coords: { x: 0, y: 65, r: 55 },
    camera: { scale: 1.45, x: 0, y: -90 },
    exercises: [
      { title: "Barbell Back Squats", detail: "Quad & glute power • 5 Sets x 5 Reps" },
      { title: "Romanian Deadlift", detail: "Hamstring stretch & loaded eccentrics • 4 Sets x 8 Reps" },
      { title: "Heavy Leg Press 45°", detail: "Quad sweep hypertrophy • 4 Sets x 12 Reps" },
    ],
    gear: "Squat Rack & 45 Degree Leg Press",
    goal: "Quad Sweep & Lower Body Power",
  },
  {
    id: "core",
    name: "CORE",
    fullName: "Rectus Abdominis & Obliques",
    icon: "⚡",
    color: "#f5cd79",
    view: "front",
    coords: { x: 0, y: 8, r: 35 },
    camera: { scale: 1.75, x: 0, y: -10 },
    exercises: [
      { title: "Hanging Leg Raises", detail: "Lower ab compression • 4 Sets x 15 Reps" },
      { title: "Cable Woodchoppers", detail: "Rotational oblique power • 3 Sets x 15 Reps" },
      { title: "Weighted Decline Crunches", detail: "Upper 6-pack brick density • 3 Sets x 12 Reps" },
    ],
    gear: "Pull-up Station & Cable Tower",
    goal: "6-Pack Brick Density & Core Stability",
  },
];

export default function MuscleVisualizer3D() {
  const [headRef, headIn] = useReveal();
  const [activeMuscleId, setActiveMuscleId] = useState("chest");
  const [viewAngle, setViewAngle] = useState("front"); // "front" | "back"
  const [autoRotate, setAutoRotate] = useState(true);
  const [hoveredMuscle, setHoveredMuscle] = useState(null);

  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const cameraRef = useRef({ scale: 1.65, x: 0, y: 70 });

  // Automatically switch view if selected muscle belongs to front/back
  const handleSelectMuscle = (id) => {
    setActiveMuscleId(id);
    const m = MUSCLE_GROUPS.find((group) => group.id === id);
    if (m && m.view) {
      setViewAngle(m.view);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationId;
    let time = 0;

    const particles = Array.from({ length: 40 }, () => ({
      angle: Math.random() * Math.PI * 2,
      dist: Math.random() * 60 + 15,
      speed: Math.random() * 0.02 + 0.008,
      radius: Math.random() * 2 + 1,
    }));

    const getCanvasCoordinates = (e) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.clientX - rect.left - rect.width / 2;
      const clientY = e.clientY - rect.top - rect.height / 2;

      // Transform raw screen click coords back to mannequin local space (taking camera scale & pan into account)
      const currentCam = cameraRef.current;
      const localX = (clientX - currentCam.x) / currentCam.scale;
      const localY = (clientY - currentCam.y) / currentCam.scale;

      return { clientX, clientY, localX, localY };
    };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) * 0.003;
      const y = (e.clientY - rect.top - rect.height / 2) * 0.003;
      mouseRef.current = { x, y };

      const { localX, localY } = getCanvasCoordinates(e);

      let found = null;
      MUSCLE_GROUPS.forEach((m) => {
        const dx = localX - m.coords.x;
        const dy = localY - m.coords.y;
        if (Math.sqrt(dx * dx + dy * dy) < m.coords.r) {
          found = m.id;
        }
      });
      setHoveredMuscle(found);
    };

    const handleClick = (e) => {
      const { localX, localY } = getCanvasCoordinates(e);

      let clickedMuscle = null;
      MUSCLE_GROUPS.forEach((m) => {
        const dx = localX - m.coords.x;
        const dy = localY - m.coords.y;
        if (Math.sqrt(dx * dx + dy * dy) < m.coords.r + 10) {
          clickedMuscle = m.id;
        }
      });

      if (clickedMuscle) {
        handleSelectMuscle(clickedMuscle);
      }
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("click", handleClick);

    function drawUltra3DMaleModel(ctx, activeId, view, time, mouse) {
      const isBack = view === "back";
      const rotY = autoRotate ? Math.sin(time * 0.8) * 0.12 + mouse.x * 0.4 : mouse.x * 0.4;
      const rotX = mouse.y * 0.3;

      ctx.save();
      // Apply 3D perspective distortion & slight rotation
      ctx.transform(1, rotX * 0.08, rotY * 0.16, 1, 0, 0);

      // --- 1. 3D HOLOGRAM BASE PEDESTAL & DEPTH SHADOW ---
      ctx.save();
      ctx.translate(0, 160);
      ctx.scale(1, 0.3);

      // 3D Drop Shadow underneath mannequin
      const shadowGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, 150);
      shadowGrad.addColorStop(0, "rgba(0, 0, 0, 0.85)");
      shadowGrad.addColorStop(0.5, "rgba(0, 0, 0, 0.4)");
      shadowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = shadowGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 150, 0, Math.PI * 2);
      ctx.fill();

      // Outer Hologram Rings
      ctx.strokeStyle = "rgba(240, 201, 107, 0.3)";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, 140, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = "#f0c96b";
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(0, 0, 140, time * 2.2, time * 2.2 + 1.4);
      ctx.stroke();

      ctx.restore();

      // --- 2. HOLOGRAPHIC SCANNING LASER BEAM ---
      const scanY = Math.sin(time * 1.6) * 145;
      const scanGrad = ctx.createLinearGradient(0, scanY - 8, 0, scanY + 8);
      scanGrad.addColorStop(0, "rgba(240, 201, 107, 0)");
      scanGrad.addColorStop(0.5, "rgba(240, 201, 107, 0.45)");
      scanGrad.addColorStop(1, "rgba(240, 201, 107, 0)");
      ctx.fillStyle = scanGrad;
      ctx.fillRect(-150, scanY - 8, 300, 16);

      // --- 3. HYPER-REALISTIC 3D MALE MUSCULAR MANNEQUIN BASE BODY ---
      // 3D Specular Light Position based on Mouse Tilt
      const lightX = mouse.x * 60 - 30;
      const lightY = mouse.y * 60 - 60;

      // Volumetric 3D Shaded Metallic Body Fill
      const body3DGrad = ctx.createRadialGradient(lightX, lightY, 10, 0, 0, 180);
      body3DGrad.addColorStop(0, "#3a3426");
      body3DGrad.addColorStop(0.3, "#222019");
      body3DGrad.addColorStop(0.7, "#141310");
      body3DGrad.addColorStop(1, "#0a0a0c");

      // Sculpted Male Body Outline
      ctx.beginPath();
      // Head with Sculpted Jawline
      ctx.arc(0, -125, 22, 0, Math.PI * 2);

      // Traps & Neck
      ctx.moveTo(-11, -106);
      ctx.lineTo(-26, -98);
      ctx.lineTo(-62, -82); // Broad shoulder tip
      ctx.lineTo(-78, -45); // Muscular bicep sweep
      ctx.lineTo(-70, -8);  // Forearm flexor
      ctx.lineTo(-58, 28);  // Wrist
      ctx.lineTo(-46, 24);  // Inner forearm
      ctx.lineTo(-44, -22); // Narrow waist line (V-taper)
      ctx.lineTo(-42, 16);  // Hip
      ctx.lineTo(-52, 88);  // Outer quad sweep
      ctx.lineTo(-42, 146); // Outer calf
      ctx.lineTo(-28, 160); // Ankle
      ctx.lineTo(-12, 160); // Inner ankle
      ctx.lineTo(-6, 68);   // Inseam
      ctx.lineTo(0, 32);    // Crotch
      ctx.lineTo(6, 68);
      ctx.lineTo(12, 160);
      ctx.lineTo(28, 160);
      ctx.lineTo(40, 146);
      ctx.lineTo(52, 88);
      ctx.lineTo(42, 16);
      ctx.lineTo(44, -22);
      ctx.lineTo(46, 24);
      ctx.lineTo(58, 28);
      ctx.lineTo(70, -8);
      ctx.lineTo(78, -45);
      ctx.lineTo(62, -82);
      ctx.lineTo(26, -98);
      ctx.lineTo(11, -106);
      ctx.closePath();

      ctx.fillStyle = body3DGrad;
      ctx.fill();

      // 3D Rim Lighting Edge Glow
      ctx.strokeStyle = "rgba(240, 201, 107, 0.55)";
      ctx.lineWidth = 2.5;
      ctx.shadowColor = "rgba(240, 201, 107, 0.4)";
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.shadowBlur = 0; // Reset shadow

      // --- 4. 3D VOLUMETRIC MUSCLE GROUP MESHES & FIBER STRIATIONS ---

      // Master 3D Muscle Renderer
      const renderVolumetric3DMuscle = (pathFn, isActive, isHovered, muscleColor = "#f0c96b", centerOffset = { x: 0, y: 0 }) => {
        ctx.save();
        pathFn();

        if (isActive) {
          // Hyper 3D Active State: Intense Metallic Gold Specular Fill + Volumetric Glow
          const actGrad = ctx.createRadialGradient(
            centerOffset.x,
            centerOffset.y,
            2,
            centerOffset.x,
            centerOffset.y,
            65
          );
          actGrad.addColorStop(0, "#ffffff");
          actGrad.addColorStop(0.25, "#ffe599");
          actGrad.addColorStop(0.65, muscleColor);
          actGrad.addColorStop(1, muscleColor + "aa");

          ctx.fillStyle = actGrad;
          ctx.fill();

          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 2.8;
          ctx.shadowColor = muscleColor;
          ctx.shadowBlur = 22;
          ctx.stroke();

          // 3D Specular Highlight Overlay Line
          ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
          ctx.lineWidth = 1.5;
          ctx.stroke();
        } else if (isHovered) {
          ctx.fillStyle = "rgba(240, 201, 107, 0.45)";
          ctx.fill();
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 2;
          ctx.stroke();
        } else {
          // Passive 3D Shaded State
          const passGrad = ctx.createLinearGradient(-30, -30, 30, 30);
          passGrad.addColorStop(0, "rgba(240, 201, 107, 0.16)");
          passGrad.addColorStop(1, "rgba(240, 201, 107, 0.04)");
          ctx.fillStyle = passGrad;
          ctx.fill();

          ctx.strokeStyle = "rgba(240, 201, 107, 0.35)";
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }
        ctx.restore();
      };

      // A) SHOULDERS (3D Cannonball Deltoid Caps)
      const isDeltActive = activeId === "shoulders";
      const isDeltHovered = hoveredMuscle === "shoulders";
      renderVolumetric3DMuscle(
        () => {
          ctx.beginPath();
          // Left Delt Cap (Anterior, Lateral, Posterior heads)
          ctx.ellipse(-56, -70, 19, 26, -0.3, 0, Math.PI * 2);
          // Right Delt Cap
          ctx.ellipse(56, -70, 19, 26, 0.3, 0, Math.PI * 2);
        },
        isDeltActive,
        isDeltHovered,
        "#f7b731",
        { x: 0, y: -70 }
      );

      // B) ARMS (3D Bicep Peaks, Horseshoe Triceps & Forearms)
      const isArmActive = activeId === "arms";
      const isArmHovered = hoveredMuscle === "arms";
      renderVolumetric3DMuscle(
        () => {
          ctx.beginPath();
          // Left Upper Arm
          ctx.ellipse(-60, -42, 15, 24, -0.15, 0, Math.PI * 2);
          // Left Forearm flexors
          ctx.ellipse(-56, -2, 11, 20, -0.2, 0, Math.PI * 2);
          // Right Upper Arm
          ctx.ellipse(60, -42, 15, 24, 0.15, 0, Math.PI * 2);
          // Right Forearm flexors
          ctx.ellipse(56, -2, 11, 20, 0.2, 0, Math.PI * 2);
        },
        isArmActive,
        isArmHovered,
        "#ffd580",
        { x: -55, y: -30 }
      );

      if (!isBack) {
        // --- FRONT VIEW 3D ANATOMY ---

        // C) CHEST (Sculpted 3D Pectoralis Major Slabs)
        const isChestActive = activeId === "chest";
        const isChestHovered = hoveredMuscle === "chest";
        renderVolumetric3DMuscle(
          () => {
            ctx.beginPath();
            // Left Pec Slab
            ctx.moveTo(-5, -74);
            ctx.lineTo(-44, -74);
            ctx.lineTo(-40, -36);
            ctx.lineTo(-5, -42);
            ctx.closePath();
            // Right Pec Slab
            ctx.moveTo(5, -74);
            ctx.lineTo(44, -74);
            ctx.lineTo(40, -36);
            ctx.lineTo(5, -42);
            ctx.closePath();
          },
          isChestActive,
          isChestHovered,
          "#f0c96b",
          { x: 0, y: -55 }
        );

        // Render Anatomical Striation Lines on Chest
        if (isChestActive || isChestHovered) {
          ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
          ctx.lineWidth = 1.2;
          for (let y = -68; y <= -46; y += 6) {
            ctx.beginPath();
            ctx.moveTo(-38, y);
            ctx.lineTo(-8, y + 4);
            ctx.moveTo(38, y);
            ctx.lineTo(8, y + 4);
            ctx.stroke();
          }
        }

        // D) CORE (8-Pack Rectus Abdominis, Serratus Anterior & Oblique V-Cut)
        const isCoreActive = activeId === "core";
        const isCoreHovered = hoveredMuscle === "core";
        renderVolumetric3DMuscle(
          () => {
            ctx.beginPath();
            // 8-Pack Grid Bricks (4 pairs)
            const abY = [-36, -20, -5, 10, 24];
            for (let i = 0; i < abY.length - 1; i++) {
              ctx.roundRect(-25, abY[i], 22, abY[i + 1] - abY[i] - 3, 4);
              ctx.roundRect(3, abY[i], 22, abY[i + 1] - abY[i] - 3, 4);
            }
            // Serratus Anterior Finger Ribs
            ctx.moveTo(-38, -25);
            ctx.lineTo(-26, -18);
            ctx.moveTo(-38, -12);
            ctx.lineTo(-26, -5);
            ctx.moveTo(38, -25);
            ctx.lineTo(26, -18);
            ctx.moveTo(38, -12);
            ctx.lineTo(26, -5);
          },
          isCoreActive,
          isCoreHovered,
          "#f5cd79",
          { x: 0, y: 0 }
        );

        // E) LEGS (Sculpted 3D Quad Sweep, Vastus Medialis Teardrop & Calves)
        const isLegActive = activeId === "legs";
        const isLegHovered = hoveredMuscle === "legs";
        renderVolumetric3DMuscle(
          () => {
            ctx.beginPath();
            // Left Outer Quad Sweep
            ctx.ellipse(-28, 68, 19, 44, -0.1, 0, Math.PI * 2);
            // Left Vastus Medialis (Teardrop)
            ctx.ellipse(-18, 92, 10, 16, 0.1, 0, Math.PI * 2);
            // Left Calf
            ctx.ellipse(-28, 140, 13, 24, -0.05, 0, Math.PI * 2);

            // Right Outer Quad Sweep
            ctx.ellipse(28, 68, 19, 44, 0.1, 0, Math.PI * 2);
            // Right Vastus Medialis (Teardrop)
            ctx.ellipse(18, 92, 10, 16, -0.1, 0, Math.PI * 2);
            // Right Calf
            ctx.ellipse(28, 140, 13, 24, 0.05, 0, Math.PI * 2);
          },
          isLegActive,
          isLegHovered,
          "#fa8231",
          { x: 0, y: 65 }
        );
      } else {
        // --- BACK VIEW 3D ANATOMY ---

        // F) BACK (3D V-Taper Lat Wings & Trapezius Diamond)
        const isBackActive = activeId === "back";
        const isBackHovered = hoveredMuscle === "back";
        renderVolumetric3DMuscle(
          () => {
            ctx.beginPath();
            // Trapezius Diamond Upper Back
            ctx.moveTo(0, -106);
            ctx.lineTo(-38, -78);
            ctx.lineTo(0, -40);
            ctx.lineTo(38, -78);
            ctx.closePath();

            // Left Sweeping Lat Wing
            ctx.moveTo(-5, -64);
            ctx.lineTo(-52, -74);
            ctx.lineTo(-29, -6);
            ctx.lineTo(-5, -12);
            ctx.closePath();

            // Right Sweeping Lat Wing
            ctx.moveTo(5, -64);
            ctx.lineTo(52, -74);
            ctx.lineTo(29, -6);
            ctx.lineTo(5, -12);
            ctx.closePath();
          },
          isBackActive,
          isBackHovered,
          "#e6b042",
          { x: 0, y: -45 }
        );

        // Posterior Glutes & Hamstrings for BACK VIEW LEGS
        const isLegActive = activeId === "legs";
        const isLegHovered = hoveredMuscle === "legs";
        renderVolumetric3DMuscle(
          () => {
            ctx.beginPath();
            // Gluteus Maximus Slabs
            ctx.ellipse(-22, 32, 21, 23, 0, 0, Math.PI * 2);
            ctx.ellipse(22, 32, 21, 23, 0, 0, Math.PI * 2);
            // Hamstrings
            ctx.ellipse(-26, 80, 17, 30, -0.05, 0, Math.PI * 2);
            ctx.ellipse(26, 80, 17, 30, 0.05, 0, Math.PI * 2);
          },
          isLegActive,
          isLegHovered,
          "#fa8231",
          { x: 0, y: 50 }
        );
      }

      ctx.restore();
    }

    function render() {
      time += 0.03;
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;

      ctx.clearRect(0, 0, w, h);

      // Background Aura Gradient
      const activeObj = MUSCLE_GROUPS.find((m) => m.id === activeMuscleId) || MUSCLE_GROUPS[0];
      const aura = ctx.createRadialGradient(cx, cy, 10, cx, cy, 220);
      aura.addColorStop(0, activeObj.color + "22");
      aura.addColorStop(0.6, "rgba(201, 162, 75, 0.04)");
      aura.addColorStop(1, "rgba(10, 10, 11, 0)");
      ctx.fillStyle = aura;
      ctx.fillRect(0, 0, w, h);

      // --- SMOOTH CAMERA LERP (ZOOM IN & FOCUS ON ACTIVE MUSCLE) ---
      const targetCam = activeObj.camera || { scale: 1.5, x: 0, y: 0 };
      cameraRef.current.scale += (targetCam.scale - cameraRef.current.scale) * 0.08;
      cameraRef.current.x += (targetCam.x - cameraRef.current.x) * 0.08;
      cameraRef.current.y += (targetCam.y - cameraRef.current.y) * 0.08;

      ctx.save();
      // Apply Camera Scale & Pan Center
      ctx.translate(cx + cameraRef.current.x, cy + cameraRef.current.y);
      ctx.scale(cameraRef.current.scale, cameraRef.current.scale);

      // Render 3D Male Model
      drawUltra3DMaleModel(ctx, activeMuscleId, viewAngle, time, mouseRef.current);

      // Orbiting Fiber Particles Stream directly around active muscle coords
      const activeCoords = activeObj.coords;
      particles.forEach((p) => {
        p.angle += p.speed;
        const px = activeCoords.x + Math.cos(p.angle) * p.dist;
        const py = activeCoords.y + Math.sin(p.angle) * (p.dist * 0.45);

        ctx.fillStyle = activeObj.color;
        ctx.beginPath();
        ctx.arc(px, py, p.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.restore();

      animationId = requestAnimationFrame(render);
    }

    render();

    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("click", handleClick);
      cancelAnimationFrame(animationId);
    };
  }, [activeMuscleId, viewAngle, autoRotate, hoveredMuscle]);

  const activeMuscleObj = MUSCLE_GROUPS.find((m) => m.id === activeMuscleId) || MUSCLE_GROUPS[0];

  return (
    <section className="muscle-3d-section" id="muscle-map">
      <div className="wrap">
        <div className={`sec-head reveal ${headIn ? "in-view" : ""}`} ref={headRef}>
          <div>
            <div className="eyebrow">Interactive 3D Male Muscle Visualizer</div>
            <h2>
              Select Target
              <br />
              Muscle Group
            </h2>
          </div>
          <p className="muscle-head-desc">
            Click any body part on our 3D muscular male model to instantly zoom in and inspect targeted exercise
            routines designed by New Gold Gym head coaches.
          </p>
        </div>

        <div className="muscle-3d-layout">
          {/* Left Muscle Selector Buttons */}
          <div className="muscle-btn-col">
            <div className="muscle-selector-label">CHOOSE TARGET ZONE</div>
            <div className="muscle-btn-list">
              {MUSCLE_GROUPS.map((m) => (
                <button
                  key={m.id}
                  className={`muscle-nav-btn ${activeMuscleId === m.id ? "active" : ""}`}
                  onClick={() => handleSelectMuscle(m.id)}
                >
                  <span className="muscle-btn-icon">{m.icon}</span>
                  <span className="muscle-btn-text">
                    <strong>{m.name}</strong>
                    <small>{m.fullName.split("&")[0]}</small>
                  </span>
                  <span className="muscle-btn-arrow">→</span>
                </button>
              ))}
            </div>
          </div>

          {/* Center 3D Anatomical Male Model Visualizer */}
          <div className="muscle-canvas-wrap">
            {/* 3D View Toolbar Controls */}
            <div className="muscle-3d-toolbar">
              <button
                className={`toolbar-btn ${viewAngle === "front" ? "active" : ""}`}
                onClick={() => setViewAngle("front")}
              >
                Front View
              </button>
              <button
                className={`toolbar-btn ${viewAngle === "back" ? "active" : ""}`}
                onClick={() => setViewAngle("back")}
              >
                Back View
              </button>
              <button
                className={`toolbar-btn ${autoRotate ? "active" : ""}`}
                onClick={() => setAutoRotate(!autoRotate)}
                title="Toggle 3D auto rotation"
              >
                {autoRotate ? "3D Rotation: ON" : "3D Rotation: OFF"}
              </button>
            </div>

            <canvas
              ref={canvasRef}
              width={460}
              height={460}
              className={`muscle-canvas ${hoveredMuscle ? "clickable" : ""}`}
            />

            <div className="muscle-canvas-overlay">
              <span className="active-badge">
                {activeMuscleObj.icon} 3D FOCUS • {activeMuscleObj.name} ACTIVE
              </span>
              <h3>{activeMuscleObj.fullName}</h3>
            </div>
          </div>

          {/* Right Exercise & Workout Card */}
          <div className="muscle-workout-col">
            <div className="workout-card">
              <div className="workout-tag">EXERCISE PROGRAMMING</div>
              <h3>{activeMuscleObj.fullName}</h3>
              <div className="workout-goal">
                <span>GOAL:</span> {activeMuscleObj.goal}
              </div>

              <div className="exercise-list">
                {activeMuscleObj.exercises.map((ex, idx) => (
                  <div className="exercise-item" key={idx}>
                    <div className="ex-num">0{idx + 1}</div>
                    <div className="ex-info">
                      <h4>{ex.title}</h4>
                      <p>{ex.detail}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="gear-rec">
                <span>RECOMMENDED EQUIPMENT:</span>
                <strong>{activeMuscleObj.gear}</strong>
              </div>

              <a href="#contact" className="btn-primary workout-cta">
                Train This Muscle Free →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

