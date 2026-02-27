import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ImageAuthLayout from "../../pages/feature-2/ImageAuthLayout";
import { apiRequest } from "../../api";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", email: "", password: "", phone: "" });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    if (!form.fullName || !form.email || !form.password) {
      setMsg("Please fill all fields.");
      return;
    }
    if (form.password.length < 8) {
      setMsg("Password must be at least 8 characters.");
      return;
    }

    try {
      setLoading(true);

      await apiRequest("/api/auth/register", {
        method: "POST",
        body: {
          name: form.fullName,
          email: form.email,
          phone: form.phone || undefined,
          password: form.password,
        },
      });

      setMsg("Registered successfully. Redirecting to login...");
      setTimeout(() => navigate("/login"), 600);
    } catch (err) {
      setMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageAuthLayout>
      <div className="card">
        <h2 className="card-title">Create your account</h2>
        <p className="card-sub">Join the cooperative portal to vote and track your savings.</p>

        <form className="form" onSubmit={onSubmit}>
          <label className="label">Full Name</label>
          <input
            className="input"
            name="fullName"
            value={form.fullName}
            onChange={onChange}
            placeholder="Your name"
            required
          />

          <label className="label">Phone (optional)</label>
          <input
            className="input"
            name="phone"
            value={form.phone}
            onChange={onChange}
            placeholder="0771234567"
          />

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
            placeholder="At least 8 characters"
            required
            minLength={8}
          />

          {msg ? <div className="msg">{msg}</div> : null}

          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Creating..." : "Register"}
          </button>
        </form>

        <div className="card-footer">
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </div>
    </ImageAuthLayout>
  );
}