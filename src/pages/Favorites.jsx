import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, LoaderCircle, RefreshCw } from "lucide-react";
import { toast } from "react-toastify";
import api from "../api/axios";
import TemplateCard from "../components/TemplateCard";
import "./Favorite.css";

export default function Favorites() {
  const navigate = useNavigate();

  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removingId, setRemovingId] = useState(null);

  const isLoggedIn = Boolean(localStorage.getItem("token"));

  const fetchFavorites = useCallback(async () => {
    if (!localStorage.getItem("token")) {
      setFavorites([]);
      setLoading(false);
      setError("");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.get("/favorites");

      const favoriteRecords = response.data?.favorites || [];

      // The backend populates each favorite's template field.
      const templates = favoriteRecords
        .map((favorite) => favorite.template)
        .filter((template) => template && template._id);

      setFavorites(templates);
    } catch (err) {
      if (err.response?.status === 401) {
        setFavorites([]);
        setError("Your session has expired. Please log in again.");
      } else {
        setError(
          err.response?.data?.message ||
            "Unable to load your favorite templates.",
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }

    fetchFavorites();
  }, [isLoggedIn, fetchFavorites]);

  async function handleRemoveFavorite(template) {
    try {
      setRemovingId(template._id);

      const response = await api.delete(`/favorites/${template._id}`);

      if (!response.data?.success) {
        throw new Error(response.data?.message || "Failed to remove favorite.");
      }

      setFavorites((current) =>
        current.filter((item) => item._id !== template._id),
      );

      toast.success("Removed from favorites.");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Unable to remove this template from favorites.",
      );
    } finally {
      setRemovingId(null);
    }
  }

  function handleFavorite(template) {
    if (removingId) return;
    handleRemoveFavorite(template);
  }

  if (!isLoggedIn) {
    return (
      <main className="favorites-page">
        <section className="favorites-empty">
          <div className="favorites-empty-icon">
            <Heart size={30} />
          </div>
          <h1>Your favorites</h1>
          <p>Please log in to view and manage your favorite templates.</p>
          <Link to="/login" className="btn btn-primary">
            Login to continue
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="favorites-page">
      <section className="favorites-container">
        <header className="favorites-header">
          <div>
            <span className="favorites-eyebrow">YOUR COLLECTION</span>
            <h1>My Favorites</h1>
            <p>All the templates you've saved in one place.</p>
          </div>

          {!loading && !error && (
            <span className="favorites-count">
              <Heart size={16} />
              {favorites.length}{" "}
              {favorites.length === 1 ? "template" : "templates"}
            </span>
          )}
        </header>

        {loading ? (
          <div className="favorites-status" role="status">
            <LoaderCircle className="favorites-spinner" size={30} />
            <p>Loading your favorites...</p>
          </div>
        ) : error ? (
          <div className="favorites-status">
            <p>{error}</p>
            <button
              type="button"
              className="btn btn-outline"
              onClick={fetchFavorites}
            >
              <RefreshCw size={16} />
              Try again
            </button>
            {error.includes("session has expired") && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => navigate("/login")}
              >
                Login again
              </button>
            )}
          </div>
        ) : favorites.length === 0 ? (
          <div className="favorites-empty">
            <div className="favorites-empty-icon">
              <Heart size={30} />
            </div>
            <h2>No favorites yet</h2>
            <p>Browse the collection and save templates you want to revisit.</p>
            <Link to="/templates" className="btn btn-primary">
              Explore templates
            </Link>
          </div>
        ) : (
          <div className="favorites-grid">
            {favorites.map((template) => (
              <div className="favorites-item" key={template._id}>
                <TemplateCard
                  template={template}
                  isFavorite={true}
                  onFavorite={handleRemoveFavorite}
                />
                {removingId === template._id && (
                  <div className="favorites-removing" role="status">
                    <LoaderCircle size={16} className="favorites-spinner" />
                    Removing...
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
