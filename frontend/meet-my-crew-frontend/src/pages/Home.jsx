import { Link } from "react-router-dom";
import {
  Check,
  Mail,
  MapPin,
  Phone,
  Search,
  SquareUserRound,
  FolderKanban,
  Gem,
} from "lucide-react";
import heroImage from "../assets/hero-image.jpeg";
import aboutImage from "../assets/about-image.jpeg";
import "./Home.css";

const navLinks = [
  { label: "Home", href: "#hero" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

const aboutPoints = [
  "Connect with local media professionals",
  "Build your team faster and easier",
  "Manage projects all in one place",
];

const featureCards = [
  {
    title: "Create a Profile",
    description: "Showcase your skills and experience",
    icon: SquareUserRound,
    accent: "blue",
  },
  {
    title: "Discover Creatives",
    description: "Find talent based on role and location",
    icon: Search,
    accent: "teal",
  },
  {
    title: "Start Projects",
    description: "Build and manage your creative team",
    icon: FolderKanban,
    accent: "indigo",
  },
];

const contactItems = [
  { icon: Phone, text: "+237 682345155" },
  { icon: Mail, text: "nateufarhel0@gmail.com" },
  { icon: MapPin, text: "Douala, Cameroon" },
];

function Brand() {
  return (
    <div className="landing-brand">
      <span className="landing-brand__icon" aria-hidden="true">
        <Gem size={14} strokeWidth={2.2} />
      </span>
      <span>Meet My Crew</span>
    </div>
  );
}

export default function Home() {
  return (
    <div className="landing-page">
      <div className="landing-shell">
        <section
          id="hero"
          className="hero-section"
          style={{
            "--hero-image": `linear-gradient(rgba(6, 14, 28, 0.72), rgba(6, 14, 28, 0.78)), url(${heroImage})`,
          }}
        >
          <header className="landing-navbar">
            <a href="#hero" className="landing-navbar__brand" aria-label="Meet My Crew home">
              <Brand />
            </a>

            <nav className="landing-navbar__links" aria-label="Primary navigation">
              {navLinks.map((link) => (
                <a key={link.label} href={link.href}>
                  {link.label}
                </a>
              ))}
            </nav>

            <Link to="/register" className="landing-button landing-button--primary landing-button--nav">
              Get Started
            </Link>
          </header>

          <div className="hero-section__content">
            <div className="hero-section__copy">
              <h1>
                Build Your Creative
                <br />
                Dream Team <span>Faster</span>
              </h1>
              <p>Connect with filmmakers, actors, and creators near you</p>

              <div className="hero-section__actions">
                <Link to="/register" className="landing-button landing-button--primary">
                  Get Started
                </Link>
                <Link to="/register" className="landing-button landing-button--ghost">
                  Explore Creatives
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="about-section">
          <div className="about-section__grid">
            <div className="about-section__content">
              <h2>About Meet My Crew</h2>
              <p className="about-section__lead">A simple path from obscurity to production.</p>
              <p>
                Our platform helps creative teams form naturally with smart structure to keep work moving
                forward.
              </p>

              <ul className="about-section__list">
                {aboutPoints.map((point) => (
                  <li key={point}>
                    <span className="about-section__check" aria-hidden="true">
                      <Check size={16} strokeWidth={3} />
                    </span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="about-section__image-wrapper">
              <img className="about-section__image" src={aboutImage} alt="Creative team working on set" />
            </div>
          </div>
        </section>

        <section className="features-section" aria-labelledby="features-title">
          <h2 id="features-title" className="sr-only">
            Features
          </h2>

          <div className="feature-cards">
            {featureCards.map(({ title, description, icon: Icon, accent }) => (
              <article key={title} className="feature-card">
                <div className={`feature-card__icon feature-card__icon--${accent}`} aria-hidden="true">
                  <Icon size={22} strokeWidth={2.2} />
                </div>
                <div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="contact" className="contact-section">
          <div className="contact-section__panel">
            <div className="contact-section__info">
              <h2>Contact Us</h2>
              <p>
                Have questions or need help? Send us a message and we&apos;ll get back to you shortly.
              </p>

              <div className="contact-section__details">
                {contactItems.map(({ icon: Icon, text }) => (
                  <div key={text} className="contact-section__detail">
                    <Icon size={18} />
                    <span>{text}</span>
                  </div>
                ))}
              </div>

              <div className="contact-section__details contact-section__details--secondary">
                {contactItems.slice(0, 2).map(({ icon: Icon, text }) => (
                  <div key={`secondary-${text}`} className="contact-section__detail">
                    <Icon size={18} />
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="contact-form-card">
              <h3>Contact Us</h3>
              <p>Have questions or need help? Send us a message and we&apos;ll get back to you shortly.</p>

              <form className="contact-form-card__form">
                <input type="text" name="name" placeholder="Name" />
                <input type="email" name="email" placeholder="Email" />
                <textarea name="message" rows="5" placeholder="Message..." />
                <button type="submit" className="landing-button landing-button--primary contact-form-card__submit">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </section>

        <footer className="landing-footer">
          <div className="landing-footer__top">
            <Brand />

            <nav className="landing-footer__nav" aria-label="Footer navigation">
              {navLinks.map((link) => (
                <a key={link.label} href={link.href}>
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          <p className="landing-footer__copyright">
            {"\u00A9"} {new Date().getFullYear()} Meet My Crew. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}
