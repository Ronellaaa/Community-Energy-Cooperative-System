import bg from "../../assets/bg.png";

export default function ImageAuthLayout({ children }) {
  return (
    <div className="img-auth-page">
      <img className="img-auth-bg" src={bg} alt="background" />

      {/* ✅ TEXT overlay (NOT inside white-area-box) */}
      <div className="white-hero-text">
        <div className="hero-small">WE ARE</div>

        <h1 className="hero-title">
          SOLVING <br />
          GLOBAL <br />
          PROBLEMS
        </h1>

        
        <div className="hero-line" />
      </div>

      {/* ✅ FORM box stays separate */}
      <div className="white-area-box">{children}</div>
    </div>
  );
}