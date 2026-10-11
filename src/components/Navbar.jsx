import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Heart,
  LayoutGrid,
  Menu,
  X,
  LogOut,
  KeyRound,
  UploadCloud,
} from "lucide-react";
import { toast } from "react-toastify";
import ThemeToggle from "./ThemeToggle";
import "./Navbar.css";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Templates", to: "/templates" },
  { label: "Favorites", to: "/favorites", icon: Heart },
];

function getStoredUser() {
  try {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) return null;

    const parsedUser = JSON.parse(storedUser);

    return parsedUser?.user || parsedUser;
  } catch {
    return null;
  }
}

function getAuthUser() {
  const token = localStorage.getItem("token");

  if (!token) {
    return null;
  }

  return getStoredUser() || {};
}

export default function Navbar() {
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(getAuthUser);
  const [profileOpen, setProfileOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    function syncAuth() {
      setUser(getAuthUser());
      setProfileOpen(false);
    }

    window.addEventListener("auth-change", syncAuth);
    window.addEventListener("storage", syncAuth);

    // Sync once on mount in case login occurred before this component mounted.
    syncAuth();

    return () => {
      window.removeEventListener("auth-change", syncAuth);
      window.removeEventListener("storage", syncAuth);
    };
  }, []);

  const displayName = user?.name || user?.email || "User";
  const initial = displayName.trim().charAt(0).toUpperCase() || "U";

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setProfileOpen(false);
    closeMenu();

    window.dispatchEvent(new Event("auth-change"));

    toast.success("Logged out successfully.");
    navigate("/login");
  }

  function handleComingSoon(feature) {
    setProfileOpen(false);
    toast.info(`${feature} will be available soon.`);
  }

  return (
    <header className="site-header">
      <nav className="navbar container" aria-label="Main navigation">
        <Link to="/" className="brand" onClick={closeMenu}>
          <span className="brand-icon">
            <LayoutGrid size={19} />
          </span>
          <span>TemplateHub</span>
        </Link>

        <button
          type="button"
          className="mobile-menu-toggle"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <div
          id="primary-navigation"
          className={`navbar-content ${menuOpen ? "is-open" : ""}`}
        >
          <div className="nav-links">
            {navLinks.map(({ label, to, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                onClick={closeMenu}
                className={({ isActive }) =>
                  `nav-link${isActive ? " active" : ""}`
                }
              >
                {Icon && <Icon size={16} />}
                {label}
              </NavLink>
            ))}
          </div>

          <div className="nav-actions">
            <ThemeToggle />

            {user !== null ? (
              <div className="profile-menu">
                <button
                  type="button"
                  className="profile-avatar"
                  aria-label="Open profile menu"
                  aria-expanded={profileOpen}
                  onClick={() => setProfileOpen((open) => !open)}
                >
                  {initial}
                </button>

                {profileOpen && (
                  <div className="profile-dropdown">
                    <div className="profile-info">
                      <p className="profile-name">{displayName}</p>

                      {user.email && (
                        <p className="profile-email">{user.email}</p>
                      )}
                    </div>

                    <div className="profile-divider" />
                    <button
                      type="button"
                      className="profile-menu-item"
                      onClick={() => {
                        setProfileOpen(false);
                        closeMenu();
                        navigate("/change-password-pass");
                      }}
                    >
                      <KeyRound size={17} />
                      <span>Change Password</span>
                    </button>

                    <button
                      type="button"
                      className="profile-menu-item"
                      onClick={() => handleComingSoon("My Uploads")}
                    >
                      <UploadCloud size={17} />
                      <span>My Uploads</span>
                    </button>

                    <div className="profile-divider" />

                    <button
                      type="button"
                      className="profile-menu-item profile-logout"
                      onClick={handleLogout}
                    >
                      <LogOut size={17} />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="btn btn-outline"
                  onClick={closeMenu}
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  className="btn btn-primary"
                  onClick={closeMenu}
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
