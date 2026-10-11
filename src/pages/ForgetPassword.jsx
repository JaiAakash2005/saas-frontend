import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Layers,
  LoaderCircle,
  ShieldCheck,
} from "lucide-react";
import { toast } from "react-toastify";
import api from "../api/axios";
import "./ForgetPassword.css";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  async function requestOtp(isResend = false) {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      toast.error("Please enter your email address.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (isResend) {
      setResending(true);
    } else {
      setLoading(true);
    }

    try {
      // Adjust this path to match your backend route.
      const response = await api.post("/auth/forgot-password", {
        email: normalizedEmail,
      });

      if (response.data.success === false) {
        toast.error(response.data.message || "Unable to send OTP.");
        return;
      }

      setOtpSent(true);
      setOtp("");

      toast.success(
        isResend ? "A new OTP has been sent." : "OTP sent! Check your email.",
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to send OTP. Please try again.",
      );
    } finally {
      setLoading(false);
      setResending(false);
    }
  }

  async function handleVerifyOtp(event) {
    event.preventDefault();

    if (!otpSent) {
      toast.error("Please request an OTP first.");
      return;
    }

    if (!/^\d{6}$/.test(otp.trim())) {
      toast.error("Enter the 6-digit OTP.");
      return;
    }

    setLoading(true);

    try {
      // Adjust this path to match your backend route.
      const response = await api.post("/auth/verify-reset-otp", {
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
      });

      if (!response.data.success || !response.data.resetToken) {
        toast.error(response.data.message || "OTP verification failed.");
        return;
      }

      sessionStorage.setItem("resetToken", response.data.resetToken);
      sessionStorage.setItem("resetEmail", email.trim().toLowerCase());

      toast.success("Email verified successfully!");
      navigate("/change-password", { replace: true });
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Invalid or expired OTP. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="forgot-page">
      <section className="forgot-card">
        <Link to="/" className="forgot-brand">
          <span className="forgot-brand-icon">
            <Layers size={23} />
          </span>
          <span>TemplateHub</span>
        </Link>

        <div className="forgot-heading">
          <div className="forgot-heading-icon">
            {otpSent ? <ShieldCheck size={25} /> : <CheckCircle2 size={25} />}
          </div>

          <h1>{otpSent ? "Verify your email" : "Forgot password?"}</h1>

          <p>
            {otpSent
              ? `Enter the 6-digit code sent to ${email}.`
              : "No worries! Enter your registered email and we'll send you an OTP to verify your identity."}
          </p>
        </div>

        <form className="forgot-form" onSubmit={handleVerifyOtp}>
          <div className="forgot-field">
            <label htmlFor="forgot-email">Email address</label>

            <input
              id="forgot-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setOtpSent(false);
                setOtp("");
              }}
              disabled={otpSent}
              required
            />
          </div>

          {!otpSent ? (
            <button
              type="button"
              className="forgot-submit"
              disabled={loading}
              onClick={() => requestOtp(false)}
            >
              {loading ? (
                <>
                  <LoaderCircle size={18} className="forgot-spinner" />
                  Sending OTP...
                </>
              ) : (
                "Send OTP"
              )}
            </button>
          ) : (
            <>
              <div className="forgot-field">
                <label htmlFor="forgot-otp">Verification OTP</label>

                <input
                  id="forgot-otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(event) =>
                    setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  maxLength={6}
                  required
                />

                <p className="forgot-hint">
                  <ShieldCheck size={15} />
                  Check your inbox for the verification code.
                </p>
              </div>

              <button
                type="submit"
                className="forgot-submit"
                disabled={loading || otp.length !== 6}
              >
                {loading ? (
                  <>
                    <LoaderCircle size={18} className="forgot-spinner" />
                    Verifying...
                  </>
                ) : (
                  "Verify OTP"
                )}
              </button>

              <div className="forgot-resend-row">
                <span>Didn't receive the code?</span>

                <button
                  type="button"
                  className="forgot-resend"
                  disabled={resending || loading}
                  onClick={() => requestOtp(true)}
                >
                  {resending ? "Resending..." : "Resend OTP"}
                </button>
              </div>
            </>
          )}
        </form>

        <Link to="/login" className="forgot-back">
          <ArrowLeft size={16} />
          Back to login
        </Link>
      </section>
    </main>
  );
}
