import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, LockKeyhole, ArrowLeft, ShieldCheck } from "lucide-react";
import { toast } from "react-toastify";
import api from "../api/axios";
import "./ChangePasswordByPass.css";

export default function ChangePasswordByPass() {
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const isLoggedIn = Boolean(localStorage.getItem("token"));

  async function handleSubmit(event) {
    event.preventDefault();

    if (!isLoggedIn) {
      toast.error("Please log in to change your password.");
      navigate("/login", { replace: true });
      return;
    }

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields.");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Your new password must contain at least 8 characters.");
      return;
    }

    if (currentPassword === newPassword) {
      toast.error("Your new password must differ from your current password.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("The new passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/change-password", {
        currentPassword,
        newPassword,
      });

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || "Unable to change your password.",
        );
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      toast.success(response.data.message || "Password changed successfully.");
      navigate("/");
    } catch (error) {
      if (error.response?.status === 401) {
        const message =
          error.response?.data?.message ||
          "Your session has expired. Please log in again.";

        toast.error(message);

        if (
          !localStorage.getItem("token") ||
          /token|session|unauthorized/i.test(message)
        ) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.dispatchEvent(new Event("auth-change"));
          navigate("/login", { replace: true });
        }

        return;
      }

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (!isLoggedIn) {
    return (
      <main className="change-password-page">
        <section className="change-password-card">
          <div className="change-password-icon">
            <LockKeyhole size={27} />
          </div>
          <h1>Login required</h1>
          <p className="change-password-description">
            Please log in to your TemplateHub account before changing your
            password.
          </p>
          <Link to="/login" className="change-password-submit">
            Go to Login
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="change-password-page">
      <section className="change-password-card">
        <div className="change-password-icon">
          <LockKeyhole size={27} />
        </div>

        <h1>Change password</h1>
        <p className="change-password-description">
          Update your password to keep your TemplateHub account secure.
        </p>

        <div className="change-password-security-note">
          <ShieldCheck size={19} />
          <span>Confirm your current password before choosing a new one.</span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="change-password-field">
            <label htmlFor="current-password">Current password</label>
            <div className="change-password-input-wrap">
              <input
                id="current-password"
                type={showCurrentPassword ? "text" : "password"}
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                autoComplete="current-password"
                required
                disabled={loading}
              />
              <button
                type="button"
                className="change-password-visibility"
                onClick={() => setShowCurrentPassword((visible) => !visible)}
                aria-label={
                  showCurrentPassword ? "Hide password" : "Show password"
                }
                disabled={loading}
              >
                {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="change-password-field">
            <label htmlFor="new-password">New password</label>
            <div className="change-password-input-wrap">
              <input
                id="new-password"
                type={showNewPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                minLength={8}
                autoComplete="new-password"
                required
                disabled={loading}
              />
              <button
                type="button"
                className="change-password-visibility"
                onClick={() => setShowNewPassword((visible) => !visible)}
                aria-label={showNewPassword ? "Hide password" : "Show password"}
                disabled={loading}
              >
                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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
                placeholder="Re-enter new password"
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
            {loading ? "Updating password..." : "Update password"}
          </button>
        </form>

        <Link to="/" className="change-password-back">
          <ArrowLeft size={16} />
          Back to TemplateHub
        </Link>
      </section>
    </main>
  );
}
