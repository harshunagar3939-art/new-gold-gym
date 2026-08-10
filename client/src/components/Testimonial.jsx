import useReveal from "../hooks/useReveal";

export default function Testimonial() {
  const [ref, inView] = useReveal();
  return (
    <section>
      <div className={`wrap testimonial reveal ${inView ? "in-view" : ""}`} ref={ref}>
        <div className="eyebrow" style={{ justifyContent: "center", marginBottom: 28 }}>
          Member Story
        </div>
        <p className="quote">
          "I walked in unable to do a single pull-up. <span className="hl">Ten months later</span> I
          deadlift twice my bodyweight."
        </p>
        <p className="who">— KAVYA DESAI, MEMBER SINCE 2024</p>
      </div>
    </section>
  );
}
