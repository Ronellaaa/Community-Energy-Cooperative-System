import { Link } from "react-router-dom";

export default function AuthLayout({ title, subtitle, children, footerLink }) {
  return (
    <div className="page">
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">CARBONEX</div>

          <nav className="nav">
            <a href="#">ABOUT US</a>
            <a href="#">SERVICES</a>
            <a href="#">CLIENTS</a>
            <a href="#">IMPACT PROJECTS</a>
          </nav>

          <Link className="pill" to="/register">
            CONTACT US
          </Link>
        </div>
      </header>

      <main className="wrap">
        <section className="grid">
          {/* Hero */}
          <div className="hero">
            <div className="hero-bg">
              <span className="blob b1" />
              <span className="blob b2" />
              <span className="blob b3" />
            </div>

            <div className="hero-content">
              <div className="badge">🌿 Community Energy Cooperative</div>

              <h1 className="hero-title">
                WE ARE <br />
                SOLVING <br />
                GLOBAL PROBLEMS
              </h1>

              <p className="hero-text">
                Join the cooperative, track your contribution & savings, and vote
                transparently.
              </p>

              <div className="hero-actions">
                <button className="btn-green">SCHEDULE A CONSULTATION</button>
                <Link className="btn-outline" to="/login">
                  Member Portal
                </Link>
              </div>

              <div className="stats">
                <div className="stat">
                  <div className="num">5.7</div>
                  <div className="lbl">CO₂ Tons Prevented</div>
                </div>
                <div className="stat">
                  <div className="num">68</div>
                  <div className="lbl">Members Joined</div>
                </div>
                <div className="stat">
                  <div className="num">13</div>
                  <div className="lbl">Active Projects</div>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="card">
            <h2 className="card-title">{title}</h2>
            <p className="card-sub">{subtitle}</p>

            <div className="card-body">{children}</div>

            {footerLink ? <div className="card-footer">{footerLink}</div> : null}
          </div>
        </section>
      </main>
    </div>
  );
}