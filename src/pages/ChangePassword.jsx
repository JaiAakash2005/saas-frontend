import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, LockKeyhole, ArrowLeft } from "lucide-react";
import { toast } from "react-toastify";
import api from "../api/axios";
import "./ChangePassword.css";

export default function ChangePassword() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const resetToken = sessionStorage.getItem("resetToken");

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!resetToken) {
      toast.error(
        "Your password reset session has expired. Please request a new OTP.",
      );
      navigate("/forgot-password", { replace: true });
      return;
    }

    if (password.length < 8) {
      toast.error("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/reset-password", {
        resetToken,
        password,
      });

      if (!response.data?.success) {
        throw new Error(response.data?.message || "Unable to reset password.");
      }

      sessionStorage.removeItem("resetToken");
      sessionStorage.removeItem("resetEmail");

      // Ensure this flow ends at Login, not an authenticated session.
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("auth-change"));

      toast.success("Password changed successfully. Please log in.");
      navigate("/login", { replace: true });
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Unable to change your password. Please try again.";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="change-password-page">
      <section className="change-password-card">
        <div className="change-password-icon">
          <LockKeyhole size={27} />
        </div>

        <h1>Set a new password</h1>
        <p className="change-password-description">
          Choose a strong password for your TemplateHub account.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="change-password-field">
            <label htmlFor="new-password">New password</label>
            <div className="change-password-input-wrap">
              <input
                id="new-password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your new password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={8}
                autoComplete="new-password"
                required
                disabled={loading}
              />
              <button
                type="button"
                className="change-password-visibility"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                disabled={loading}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <span className="change-password-hint">
              Use at least 8 characters.
            </span>
          </div>

          <div className="change-password-field">
            <label htmlFor="confirm-password">Confirm new password</label>
            <div className="change-password-input-wrap">
              <input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Re-enter your new password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
                required
                disabled={loading}
              />
              <button
                type="button"
                className="change-password-visibility"
                onClick={() => setShowConfirmPassword((visible) => !visible)}
                aria-label={
                  showConfirmPassword
                    ? "Hide confirmation password"
                    : "Show confirmation password"
                }
                disabled={loading}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="change-password-submit"
            disabled={loading}
          >
            {loading ? "Updating password..." : "Change password"}
          </button>
        </form>

        <Link to="/login" className="change-password-back">
          <ArrowLeft size={16} />
          Back to login
        </Link>
      </section>
    </main>
  );
}
