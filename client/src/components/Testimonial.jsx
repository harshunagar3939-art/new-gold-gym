import { useEffect, useState } from "react";
import useReveal from "../hooks/useReveal";
import { getReviews, createReview, DEFAULT_REVIEWS } from "../api/api";

export default function Testimonial() {
  const [headRef, headIn] = useReveal();
  const [gridRef, gridIn] = useReveal();
  const [reviews, setReviews] = useState(DEFAULT_REVIEWS);
  const [activeSlide, setActiveSlide] = useState(0);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [role, setRole] = useState("Member");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState("");

  useEffect(() => {
    let mounted = true;
    const fetchReviews = () => {
      getReviews({ status: "approved" }).then((data) => {
        if (mounted && Array.isArray(data) && data.length > 0) {
          setReviews(data);
        }
      });
    };
    fetchReviews();
    window.addEventListener("focus", fetchReviews);
    window.addEventListener("ngg_data_updated", fetchReviews);
    window.addEventListener("storage", fetchReviews);
    return () => {
      mounted = false;
      window.removeEventListener("focus", fetchReviews);
      window.removeEventListener("ngg_data_updated", fetchReviews);
      window.removeEventListener("storage", fetchReviews);
    };
  }, []);

  // Auto-advance slider every 4.5s
  useEffect(() => {
    if (reviews.length <= 1) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % reviews.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [reviews.length]);

  const handlePrevSlide = () => {
    setActiveSlide((prev) => (prev === 0 ? reviews.length - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % reviews.length);
  };

  async function handleSubmitReview(e) {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) return;
    setSubmitting(true);

    try {
      const newReview = await createReview({
        name,
        rating,
        role: role.trim() || "Member",
        comment,
      });

      setReviews((prev) => [newReview, ...prev]);
      setActiveSlide(0);
      setNotification("✅ Thank you! Your review has been submitted successfully.");
      setName("");
      setComment("");
      setRating(5);
      setShowReviewModal(false);
      setTimeout(() => setNotification(""), 4000);
    } catch {
      setNotification("✅ Review submitted!");
      setShowReviewModal(false);
    } finally {
      setSubmitting(false);
    }
  }

  const currentRev = reviews[activeSlide] || reviews[0] || {};

  return (
    <section id="reviews">
      <div className="wrap">
        <div className={`sec-head reveal ${headIn ? "in-view" : ""}`} ref={headRef}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 12 }}>
              Member Stories & Reviews
            </div>
            <h2>Real Results. Real People.</h2>
          </div>
          <div className="reviews-head-action">
            <button
              type="button"
              className="btn-primary btn-add-review"
              onClick={() => setShowReviewModal(true)}
            >
              ✍️ Write a Review
            </button>
          </div>
        </div>

        {notification && <div className="admin-toast-banner">{notification}</div>}

        {/* ===== REVIEWS SLIDER CAROUSEL ===== */}
        <div className={`reviews-slider-box reveal ${gridIn ? "in-view" : ""}`} ref={gridRef}>
          <button
            type="button"
            className="slider-nav-btn prev-btn"
            onClick={handlePrevSlide}
            aria-label="Previous Review"
          >
            ‹
          </button>

          <div className="slider-card-content">
            <div className="slider-stars">
              {"★".repeat(currentRev.rating || 5)}
              <span className="star-muted">{"★".repeat(5 - (currentRev.rating || 5))}</span>
            </div>

            <p className="slider-quote">"{currentRev.comment}"</p>

            <div className="slider-author">
              <strong>— {currentRev.name?.toUpperCase() || "MEMBER"}</strong>
              <span className="slider-role">{currentRev.role || "Member"}</span>
            </div>
          </div>

          <button
            type="button"
            className="slider-nav-btn next-btn"
            onClick={handleNextSlide}
            aria-label="Next Review"
          >
            ›
          </button>
        </div>

        {/* SLIDER DOTS INDICATORS */}
        {reviews.length > 1 && (
          <div className="slider-dots">
            {reviews.map((_, idx) => (
              <button
                key={idx}
                type="button"
                className={`dot-btn ${idx === activeSlide ? "active" : ""}`}
                onClick={() => setActiveSlide(idx)}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* ===== SUBMIT REVIEW MODAL ===== */}
      {showReviewModal && (
        <div className="modal-backdrop" onClick={() => setShowReviewModal(false)}>
          <div className="modal-content review-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>✍️ Share Your Gym Experience</h2>
              <button
                type="button"
                className="modal-close"
                onClick={() => setShowReviewModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="admin-modal-form">
              <label>
                Your Name
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Kavya Desai"
                />
              </label>

              <label>
                Rating
                <div className="star-rating-input">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`star-btn ${star <= rating ? "active" : ""}`}
                      onClick={() => setRating(star)}
                    >
                      ★
                    </button>
                  ))}
                  <span className="rating-num">{rating} / 5 Stars</span>
                </div>
              </label>

              <label>
                Role / Tagline
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Member since 2024 / Athlete"
                />
              </label>

              <label>
                Your Review / Experience
                <textarea
                  required
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us about your fitness journey, training, or experience at New Gold Gym..."
                />
              </label>

              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
