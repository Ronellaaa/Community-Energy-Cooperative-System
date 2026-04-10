
import React, { useEffect, useState } from "react";
import "../styles/EnergyHero.css";
import hom1Video from "../assets/re2.mp4";
import community from "../assets/bg2.png";
import Navbar from "../components/Navbar";
import solarAsset from "../assets/solar.jpg";
import hydroAsset from "../assets/hydro.jpg";
import windAsset from "../assets/wild.jpg";
import financeAsset from "../assets/finance-bg.png";

const hom1Slides = [
  {
    title: "Solar",
    image:
      "https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=1400&auto=format&fit=crop",
  },
  {
    title: "Wind",
    image:
      "https://images.unsplash.com/photo-1466611653911-95081537e5b7?q=80&w=1400&auto=format&fit=crop",
  },
  {
    title: "Hydro",
    image:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1400&auto=format&fit=crop",
  },
];

const hom1Stats = [
  { value: "128", label: "Communities connected" },
  { value: "24%", label: "Average member savings" },
  { value: "8.6MW", label: "Shared clean capacity" },
];

const hom1Products = [
  {
    tag: "Solar Project",
    title: "Community solar arrays",
    description:
      "High-efficiency shared solar systems for rooftops, schools, and village energy hubs with cooperative ownership built in.",
    metric: "4.2MW",
    metricLabel: "solar generation capacity",
    image: solarAsset,
  },
  {
    tag: "Wind Project",
    title: "Micro wind turbine clusters",
    description:
      "Distributed wind systems designed for exposed rural zones where communities can share generation and maintenance benefits.",
    metric: "18 sites",
    metricLabel: "wind-ready locations",
    image: windAsset,
  },
  {
    tag: "Hydro Project",
    title: "Small-scale hydro networks",
    description:
      "Low-impact hydro installations for stream and waterway regions that need stable local production across the year.",
    metric: "92%",
    metricLabel: "seasonal efficiency",
    image: hydroAsset,
  },
  {
    tag: "Storage System",
    title: "Battery and backup storage",
    description:
      "Storage units that keep member power stable during demand spikes and help renewable output stay useful after sunset.",
    metric: "24/7",
    metricLabel: "backup readiness",
    image: community,
  },
  {
    tag: "Smart Billing",
    title: "Energy credits and billing",
    description:
      "Transparent settlement, household credits, and contribution tracking so every cooperative member can see the value clearly.",
    metric: "Real-time",
    metricLabel: "settlement visibility",
    image: financeAsset,
  },
];

export default function EnergyLanding() {
  const [hom1Index, setHom1Index] = useState(0);

  useEffect(() => {
    const hom1Timer = setInterval(() => {
      setHom1Index((prev) => (prev + 1) % hom1Slides.length);
    }, 3200);

    return () => clearInterval(hom1Timer);
  }, []);

  useEffect(() => {
    const elements = document.querySelectorAll(".hom1-reveal, .hom1-line-reveal");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("hom1-active");
          }
        });
      },
      { threshold: 0.18 }
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="hom1-page">
      <section className="hom1-hero-section">
        <video className="hom1-hero-bg-video" autoPlay muted loop playsInline>
          <source src={hom1Video} type="video/mp4" />
        </video>
        <div className="hom1-hero-bg-overlay" />
        <div className="hom1-hero-noise" />
        <Navbar />

        <div className="hom1-hero-grid">
          <div className="hom1-hero-copy">
            <p className="hom1-kicker">
              COMMUNITY OWNED • SOLAR • WIND • HYDRO
            </p>

            <h1 className="hom1-main-title">
              Build the
              <span className="hom1-main-bolt">⚡</span>
              energy future
              <span className="hom1-main-break">with your community</span>
            </h1>

            <p className="hom1-main-subtitle">
              Shared renewable power systems for modern communities with
              transparent funding, smart monitoring, and fair savings.
            </p>

            <div className="hom1-cta-row">
              <button className="hom1-primary-btn">Launch a Cooperative</button>
              <button className="hom1-secondary-btn">See Member Journey</button>
            </div>

            <div className="hom1-proof-strip">
              {hom1Stats.map((stat) => (
                <div className="hom1-proof-card" key={stat.label}>
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="hom1-hero-visual">
            <div className="hom1-orbit-pill hom1-pill-1">Solar Projects</div>
            <div className="hom1-orbit-pill hom1-pill-2">Wind Energy</div>
            <div className="hom1-orbit-pill hom1-pill-3">Hydro Systems</div>
            <div className="hom1-orbit-pill hom1-pill-4">Shared Savings</div>

            <div className="hom1-visual-glow"></div>

            <div className="hom1-visual-card">
              <div className="hom1-visual-topbar">
                <span className="hom1-visual-badge">Live Cooperative Energy</span>
                <span className="hom1-visual-status">Premium Grid View</span>
              </div>
              {hom1Slides.map((item, i) => (
                <img
                  key={item.title}
                  src={item.image}
                  alt={item.title}
                  className={`hom1-visual-image ${
                    i === hom1Index ? "hom1-visual-image-active" : ""
                  }`}
                />
              ))}
              <div className="hom1-visual-sheen" />
              <div className="hom1-visual-bottom">
                <div className="hom1-visual-metric">
                  <strong>12.4k</strong>
                  <span>Homes supported</span>
                </div>
                <div className="hom1-visual-metric">
                  <strong>{hom1Slides[hom1Index].title}</strong>
                  <span>Featured technology</span>
                </div>
              </div>
            </div>

            <div className="hom1-floating-note hom1-note-left">
              <strong>24%</strong>
              <span>Average shared savings</span>
            </div>

            <div className="hom1-floating-note hom1-note-right">
              <strong>{hom1Slides[hom1Index].title}</strong>
              <span>Active energy highlight</span>
            </div>

            <div className="hom1-scroll-cue">
              <span></span>
              Scroll to explore
            </div>
          </div>
        </div>
      </section>

      <section className="hom1-feature-section">
        <div className="hom1-feature-top hom1-reveal hom1-reveal-up">
          <p className="hom1-kicker hom1-center-kicker">HOW ECOCOOP WORKS</p>
          <h2 className="hom1-feature-title">
            From community idea
            <br />
            to shared energy impact
          </h2>
          <p className="hom1-feature-subtitle">
            A smarter renewable energy journey with planning, funding,
            installation, and shared savings.
          </p>
        </div>

        <div className="hom1-timeline-wrap">
          <div className="hom1-timeline-line hom1-line-reveal"></div>

          <div className="hom1-timeline-item hom1-timeline-left hom1-reveal">
            <div className="hom1-timeline-content">
              <span className="hom1-timeline-step">STEP 01</span>
              <h3>Community Planning</h3>
              <p>
                Members identify local energy needs and choose suitable
                renewable options like solar, wind, or hydro.
              </p>
            </div>
            <div className="hom1-timeline-media">
              <img
                src={community}
                alt="community planning"
                className="hom1-timeline-image"
              />
            </div>
          </div>

          <div className="hom1-timeline-item hom1-timeline-right hom1-reveal">
            <div className="hom1-timeline-media">
              <img
                src="https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=1200&auto=format&fit=crop"
                alt="shared funding"
                className="hom1-timeline-image"
              />
            </div>
            <div className="hom1-timeline-content">
              <span className="hom1-timeline-step">STEP 02</span>
              <h3>Shared Funding</h3>
              <p>
                Contributions, cooperative funds, and support programs are
                combined to launch clean energy projects fairly.
              </p>
            </div>
          </div>

          <div className="hom1-timeline-item hom1-timeline-left hom1-reveal">
            <div className="hom1-timeline-content">
              <span className="hom1-timeline-step">STEP 03</span>
              <h3>Installation & Setup</h3>
              <p>
                Solar panels, turbines, batteries, and monitoring tools are
                deployed for reliable community energy generation.
              </p>
            </div>
            <div className="hom1-timeline-media hom1-timeline-video-card">
              <video
                className="hom1-timeline-video"
                autoPlay
                muted
                loop
                playsInline
              >
                <source src={hom1Video} type="video/mp4" />
              </video>
            </div>
          </div>

          <div className="hom1-timeline-item hom1-timeline-right hom1-reveal">
            <div className="hom1-timeline-media">
              <img
                src="https://images.unsplash.com/photo-1466611653911-95081537e5b7?q=80&w=1200&auto=format&fit=crop"
                alt="smart monitoring"
                className="hom1-timeline-image"
              />
            </div>
            <div className="hom1-timeline-content">
              <span className="hom1-timeline-step">STEP 04</span>
              <h3>Smart Monitoring</h3>
              <p>
                Track generation, maintenance, household usage, and performance
                with live cooperative energy insights.
              </p>
            </div>
          </div>

          <div className="hom1-timeline-item hom1-timeline-left hom1-reveal">
            <div className="hom1-timeline-content">
              <span className="hom1-timeline-step">STEP 05</span>
              <h3>Shared Savings</h3>
              <p>
                Members receive savings benefits, support credits, and long-term
                value through transparent distribution.
              </p>
            </div>
            <div className="hom1-timeline-media">
              <img
                src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=1200&auto=format&fit=crop"
                alt="shared savings"
                className="hom1-timeline-image"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="hom1-products-section">
        <div className="hom1-products-shell">
          <div className="hom1-products-top hom1-reveal hom1-reveal-up">
            <p className="hom1-kicker hom1-center-kicker">OUR PRODUCTS</p>
            <h2 className="hom1-products-title">
              Renewable systems designed for cooperative growth
            </h2>
            <p className="hom1-products-subtitle">
              Every product is shaped around community ownership, transparent
              energy distribution, and long-term renewable resilience.
            </p>
          </div>

          <div className="hom1-products-rail">
            {hom1Products.map((product, index) => (
              <article
                className="hom1-product-card"
                key={product.title}
                style={{ animationDelay: `${index * 120}ms` }}
              >
                <div className="hom1-product-image-wrap">
                  <img
                    className="hom1-product-image"
                    src={product.image}
                    alt={product.title}
                  />
                  <div className="hom1-product-image-overlay" />
                </div>
                <div className="hom1-product-aura" />
                <div className="hom1-product-tag">{product.tag}</div>
                <h3>{product.title}</h3>
                <p>{product.description}</p>

                <div className="hom1-product-footer">
                  <div className="hom1-product-metric">
                    <strong>{product.metric}</strong>
                    <span>{product.metricLabel}</span>
                  </div>
                  <div className="hom1-product-arrow">↗</div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
