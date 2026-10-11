import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, Layers, LoaderCircle } from "lucide-react";
import { toast } from "react-toastify";
import api from "../api/axios";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.message) {
      toast.info(location.state.message);

      // Clear the message so it won't appear again on revisiting.
      navigate(location.pathname, {
        replace: true,
        state: {},
      });
    }
  }, [location, navigate]);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const email = form.email.trim().toLowerCase();

    if (!email || !form.password) {
      toast.error("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      // Assumes your backend login route is POST /api/auth/login.
      const response = await api.post("/auth/login", {
        email,
        password: form.password,
      });

      const data = response.data;

      if (!data.success || !data.token) {
        toast.error(data.message || "Unable to log in.");
        return;
      }

      localStorage.setItem("token", data.token);

      if (response.data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      } else {
        localStorage.removeItem("user");
      }

      window.dispatchEvent(new Event("auth-change"));

      toast.success("Login successful!");
      navigate("/");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Login failed. Please check your credentials and try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <Link to="/" className="login-brand">
          <span className="login-brand-icon">
            <Layers size={23} />
          </span>
          <span>TemplateHub</span>
        </Link>

        <div className="login-heading">
          <h1>Welcome back</h1>
          <p>Log in to continue exploring amazing templates.</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <label htmlFor="login-email">Email address</label>
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="login-field">
            <label htmlFor="login-password">Password</label>

            <div className="login-password-wrap">
              <input
                id="login-password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                required
              />

              <button
                type="button"
                className="login-password-toggle"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((current) => !current)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="login-forgot-row">
              <Link to="/forgot-password" className="login-forgot-link">
                Forgot password?
              </Link>
            </div>
          </div>

          <button type="submit" className="login-submit" disabled={loading}>
            {loading ? (
              <>
                <LoaderCircle size={18} className="login-spinner" />
                Logging in...
              </>
            ) : (
              "Log in"
            )}
          </button>

          <p className="login-register">
            Don't have an account? <Link to="/register">Create an account</Link>
          </p>
        </form>
      </section>
    </main>
  );
}
