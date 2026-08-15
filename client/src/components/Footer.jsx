export default function Footer() {
  return (
    <footer>
      <div className="wrap">
        <div className="foot-grid">
          <div>
            <div className="foot-logo">
              NEW GOLD<span>•</span>GYM
            </div>
            <p>
              A strength-first gym in Surat built for people who show up. Iron, coaching and
              community — every single day.
            </p>
          </div>
          <div className="foot-col">
            <h4>Explore</h4>
            <a href="#programs">Programs</a>
            <a href="#trainers">Trainers</a>
            <a href="#pricing">Pricing</a>
          </div>
          <div className="foot-col">
            <h4>Visit Us</h4>
            <p className="foot-address">3rd floor Bhagvati Bakery, Singanpor, Surat - 395004, Gujarat</p>
            <a href="tel:+917600900309" className="foot-contact-item">📞 +91 7600900309</a>
            <a href="mailto:newgoldgym@gmail.com" className="foot-contact-item">✉️ newgoldgym@gmail.com</a>
            <a
              href="https://maps.app.goo.gl/r2B2VvLDevE37PrZA"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-map-link"
            >
              📍 Open in Google Maps ↗
            </a>
          </div>
          <div className="foot-col">
            <h4>Hours</h4>
            <a href="#">Mon–Sat: 5AM – 11PM</a>
            <a href="#">Sunday: 6AM – 9PM</a>
          </div>
        </div>

        {/* GOOGLE MAPS EMBEDDED LOCATION */}
        <div className="footer-map-container">
          <div className="footer-map-header">
            <h3>📍 FIND NEW GOLD GYM ON GOOGLE MAPS</h3>
            <a
              href="https://maps.app.goo.gl/r2B2VvLDevE37PrZA"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-map-direct"
            >
              View Full Map
            </a>
          </div>
          <div className="footer-map-iframe-wrap">
            <iframe
              title="New Gold Gym Location"
              src="https://maps.google.com/maps?q=3rd%20floor%20Bhagvati%20Bakery,%20Singanpor,%20Surat,%20Gujarat%20395004&t=&z=16&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="280"
              style={{ border: 0, borderRadius: "6px" }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>

        <div className="foot-bottom">
          <span>© 2026 New Gold Gym. All rights reserved.</span>
          <span>Built for the ones who don't skip leg day.</span>
        </div>
      </div>
    </footer>
  );
}
