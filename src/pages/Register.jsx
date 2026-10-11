import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  Layers,
  LoaderCircle,
  ShieldCheck,
} from "lucide-react";
import { toast } from "react-toastify";
import api from "../api/axios";
import "./Register.css";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    otp: "",
  });

  const [otpSent, setOtpSent] = useState(false);
  const [verified, setVerified] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    // Changing the email invalidates the previous OTP verification.
    if (name === "email") {
      setOtpSent(false);
      setVerified(false);
      setForm((current) => ({ ...current, email: value, otp: "" }));
    }
  }

  async function handleSendOtp() {
    const name = form.name.trim();
    const email = form.email.trim();

    if (!name || !email || !form.password || !form.confirmPassword) {
      toast.error("Complete all fields before verifying your email.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    if (form.password.length < 8) {
      toast.error("Password must contain at least 8 characters.");
      return;
    }

    setSendingOtp(true);

    try {
      await api.post("/auth/register/request-otp", {
        name: form.name.trim(),
        email: form.email.trim(),
      });

      setOtpSent(true);
      setVerified(false);
      toast.success("OTP sent! Check your email.");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to send OTP. Please try again.",
      );
    } finally {
      setSendingOtp(false);
    }
  }

  async function handleVerifyOtp(event) {
    event.preventDefault();

    if (!otpSent) {
      toast.error("Please request an OTP first.");
      return;
    }

    if (!form.otp.trim()) {
      toast.error("Enter the OTP sent to your email.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setVerifyingOtp(true);

    try {
      const response = await api.post("/auth/register/verify-otp", {
        email: form.email.trim(),
        otp: form.otp.trim(),
        password: form.password,
      });

      if (!response.data.success || !response.data.token) {
        throw new Error(response.data.message || "Registration failed.");
      }

      // Automatically authenticate the newly registered user.
      localStorage.setItem("token", response.data.token);

      if (response.data.user) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }
      window.dispatchEvent(new Event("auth-change"));

      // Show the green success screen and one toast.
      setVerified(true);
      toast.success("Account created successfully!");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "OTP verification failed. Please try again.",
      );
    } finally {
      setVerifyingOtp(false);
    }
  }

  return (
    <main className="register-page">
      <section className="register-card">
        <Link to="/" className="register-brand">
          <span className="register-brand-icon">
            <Layers size={23} />
          </span>
          <span>TemplateHub</span>
        </Link>

        <div className="register-heading">
          <h1>Create your account</h1>
          <p>Join TemplateHub and discover templates for your next project.</p>
        </div>

        {verified ? (
          <div className="register-success">
            <CheckCircle2 size={58} className="verified-icon" />
            <h2>Email verified successfully!</h2>
            <p>Your account has been created successfully.</p>
            <button
              type="button"
              className="register-submit"
              onClick={() => navigate("/templates", { replace: true })}
            >
              Continue to templates
            </button>
          </div>
        ) : (
          <form onSubmit={handleVerifyOtp} className="register-form">
            <div className="register-field">
              <label htmlFor="name">Full name</label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Enter your full name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="register-field">
              <label htmlFor="email">Email address</label>
              <div className="email-input-row">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  disabled={otpSent}
                  required
                />

                {verified ? (
                  <span className="email-verified-badge">
                    <CheckCircle2 size={17} /> Verified
                  </span>
                ) : (
                  <button
                    type="button"
                    className="verify-button"
                    onClick={handleSendOtp}
                    disabled={sendingOtp || otpSent}
                  >
                    {sendingOtp ? (
                      <LoaderCircle size={16} className="register-spinner" />
                    ) : otpSent ? (
                      "OTP sent"
                    ) : (
                      "Verify"
                    )}
                  </button>
                )}
              </div>
            </div>

            {otpSent && (
              <div className="register-field otp-field">
                <label htmlFor="otp">Email verification OTP</label>
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="Enter the OTP from your email"
                  value={form.otp}
                  onChange={handleChange}
                  maxLength={8}
                  required
                />
                <p className="register-hint">
                  <ShieldCheck size={15} />
                  Enter the code sent to {form.email}.
                </p>
                <button
                  type="button"
                  className="resend-button"
                  onClick={handleSendOtp}
                  disabled={sendingOtp}
                >
                  {sendingOtp ? "Sending..." : "Resend OTP"}
                </button>
              </div>
            )}

            <div className="register-field">
              <label htmlFor="password">Password</label>
              <div className="password-input-wrap">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  value={form.password}
                  onChange={handleChange}
                  disabled={otpSent}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  className="password-visibility"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((current) => !current)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="register-field">
              <label htmlFor="confirmPassword">Confirm password</label>
              <div className="password-input-wrap">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  disabled={otpSent}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  className="password-visibility"
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                  onClick={() => setShowConfirmPassword((current) => !current)}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {otpSent && (
              <p className="register-hint">
                Your account will be created after the OTP is verified.
              </p>
            )}

            <button
              type="submit"
              className="register-submit"
              disabled={!otpSent || verifyingOtp}
            >
              {verifyingOtp ? (
                <>
                  <LoaderCircle size={18} className="register-spinner" />
                  Verifying OTP...
                </>
              ) : (
                "Verify OTP & Create Account"
              )}
            </button>

            <p className="register-login">
              Already have an account? <Link to="/login">Log in</Link>
            </p>
          </form>
        )}
      </section>
    </main>
  );
}
