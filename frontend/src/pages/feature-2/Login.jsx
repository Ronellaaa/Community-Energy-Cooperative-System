import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ImageAuthLayout from "../../pages/feature-2/ImageAuthLayout";
import { apiRequest } from "../../api";
export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const goAfterLogin = (user) => {
    // SIMPLE routing rules:
    // OFFICER/ADMIN -> officer page
    if (user.role === "OFFICER") {
      navigate("/officer/dashboard", { replace: true });
      return;
    }
    if (user.role === "ADMIN") {
      navigate("/admin/officers", { replace: true });
      return;
    }
    // USER not in any community -> join community page
    if (!user.communityId) {
      navigate("/join-community", { replace: true });
      return;
    }
    // USER in a community -> member dashboard
    navigate("/member/dashboard", { replace: true });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    if (!form.email || !form.password) {
      setMsg("Please enter email and password.");
      return;
    }

    try {
      setLoading(true);

      const data = await apiRequest("/api/auth/login", {
        method: "POST",
        body: { email: form.email, password: form.password },
      });

      // backend returns: { token, user }
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      goAfterLogin(data.user);
    } catch (err) {
      setMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageAuthLayout>
      <div className="card">
        <h2 className="card-title">Welcome back</h2>
        <p className="card-sub">
          Login to access voting and cooperative updates.
        </p>

        <form className="form" onSubmit={onSubmit}>
          <label className="label">Email</label>
          <input
            className="input"
            name="email"
            type="email"
            value={form.email}
            onChange={onChange}
            placeholder="you@example.com"
            required
          />

          <label className="label">Password</label>
          <input
            className="input"
            name="password"
            type="password"
            value={form.password}
            onChange={onChange}
            placeholder="Your password"
            required
          />

          {msg ? <div className="msg">{msg}</div> : null}

          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="card-footer">
          New here? <Link to="/register">Create an account</Link>
        </div>
      </div>
    </ImageAuthLayout>
  );
}
