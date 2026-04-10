import Navbar from "../components/Navbar";
import "../styles/AboutUs.css";
import communityImage from "../assets/bg2.png";
import solarImage from "../assets/solar.jpg";
import hydroImage from "../assets/hydro.jpg";

const pillars = [
  {
    title: "Community Ownership",
    copy:
      "We build renewable systems that belong to the people who use them, creating fair access, transparent governance, and shared value.",
  },
  {
    title: "Clean Energy Access",
    copy:
      "From solar rooftops to hydro and storage-backed systems, we design practical renewable solutions for neighborhoods and cooperatives.",
  },
  {
    title: "Visible Impact",
    copy:
      "Every contribution, watt generated, and savings benefit should be easy to track so communities can trust the system they are growing.",
  },
];

export default function AboutUs() {
  return (
    <div className="about-page">
      <div className="about-bg about-bg-one" />
      <div className="about-bg about-bg-two" />
      <Navbar />

      <section className="about-hero">
        <div className="about-copy">
          <div className="about-kicker">ABOUT ECOCOOP</div>
          <h1>
            Renewable energy,
            <span> built for communities first.</span>
          </h1>
          <p>
            EcoCoop is a community energy platform focused on helping local
            groups plan, fund, manage, and benefit from renewable energy
            systems together.
          </p>

          <div className="about-metrics">
            <div className="about-metric">
              <strong>128+</strong>
              <span>communities onboarded</span>
            </div>
            <div className="about-metric">
              <strong>8.6MW</strong>
              <span>shared renewable capacity</span>
            </div>
            <div className="about-metric">
              <strong>24%</strong>
              <span>average member savings</span>
            </div>
          </div>
        </div>

        <div className="about-visual">
          <div className="about-card about-card-main">
            <img src={communityImage} alt="Community energy planning" />
          </div>
          <div className="about-card about-card-floating">
            <img src={solarImage} alt="Solar installation" />
          </div>
          <div className="about-card about-card-bottom">
            <img src={hydroImage} alt="Hydro energy system" />
          </div>
        </div>
      </section>

      <section className="about-values">
        <div className="about-section-top">
          <div className="about-kicker">WHAT DRIVES US</div>
          <h2>Why this cooperative energy model matters</h2>
          <p>
            We are not only building projects. We are building an energy model
            that gives communities more control, more resilience, and more
            visible long-term value.
          </p>
        </div>

        <div className="about-grid">
          {pillars.map((pillar) => (
            <article className="about-panel" key={pillar.title}>
              <div className="about-panel-badge">{pillar.title}</div>
              <p>{pillar.copy}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
