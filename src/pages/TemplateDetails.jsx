import { useEffect, useState, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Heart,
  CheckCircle2,
  Code2,
  Layers3,
  Users,
  Sparkles,
  Tag,
  Image as ImageIcon,
} from "lucide-react";
import api from "../api/axios";
import "./TemplateDetails.css";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function TemplateDetails() {
  const { id } = useParams();
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingFavorite, setSavingFavorite] = useState(false);
  const [favoriteMessage, setFavoriteMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState("");
  const navigate = useNavigate();
  const redirectHandled = useRef(false);
  useEffect(() => {
    let cancelled = false;
    if (!localStorage.getItem("token")) {
      if (redirectHandled.current) return;

      redirectHandled.current = true;

      navigate("/login", {
        replace: true,
        state: {
          message: "Please log in to view template details.",
        },
      });

      return;
    }

    async function fetchTemplate() {
      setLoading(true);
      setError("");
      setTemplate(null);
      setFavoriteMessage("");

      try {
        const response = await api.get(`/templates/${id}`);
        const data = response.data.template;

        if (!cancelled) {
          setTemplate(data);
          setSelectedImage(data?.thumbnail_url || "");
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.message || "Unable to load this template.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchTemplate();

    return () => {
      cancelled = true;
    };
  }, [id, navigate]);

  useEffect(() => {}, [navigate]);

  async function handleFavorite() {
    setFavoriteMessage("");

    if (!localStorage.getItem("token")) {
      window.location.href = "/login";
      return;
    }

    try {
      setSavingFavorite(true);

      await api.post(`/favorites/${template._id}`);

      setFavoriteMessage("Template added to your favorites!");
    } catch (err) {
      const status = err.response?.status;

      setFavoriteMessage(
        status === 409
          ? "This template is already in your favorites."
          : err.response?.data?.message ||
              "Unable to save this template. Please try again.",
      );
    } finally {
      setSavingFavorite(false);
    }
  }

  if (loading) {
    return (
      <main className="container section">
        <div className="details-status" role="status">
          Loading template details...
        </div>
      </main>
    );
  }

  if (error || !template) {
    return (
      <main className="container section">
        <div className="details-error">
          <h1>Template unavailable</h1>
          <p className="details-status">{error || "Template not found."}</p>
          <Link className="btn btn-primary" to="/templates">
            Browse templates
          </Link>
        </div>
      </main>
    );
  }

  const features = template.features || [];
  const pages = template.pagesIncluded || [];
  const useCases = template.useCases || [];
  const techStack = template.techStack || [];
  const tags = template.tags || [];

  const previewImages = [
    ...new Set(
      [template.thumbnail_url, ...(template.previewImages || [])].filter(
        Boolean,
      ),
    ),
  ];

  return (
    <main className="container section template-details-page">
      <Link to="/templates" className="details-back">
        <ArrowLeft size={18} />
        Back to templates
      </Link>

      {/* Main template overview */}
      <section className="template-details">
        <div className="details-gallery">
          <div className="details-image-wrap">
            <img
              className="details-image"
              src={selectedImage || template.thumbnail_url}
              alt={`${template.name} preview`}
            />
            <span className="details-image-badge">
              <ImageIcon size={15} />
              Template preview
            </span>
          </div>

          {previewImages.length > 1 && (
            <div className="details-thumbnails">
              {previewImages.map((image, index) => (
                <button
                  type="button"
                  key={image}
                  className={`details-thumbnail ${
                    selectedImage === image ? "active" : ""
                  }`}
                  onClick={() => setSelectedImage(image)}
                  aria-label={`Show preview image ${index + 1}`}
                  aria-pressed={selectedImage === image}
                >
                  <img src={image} alt="" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="details-content">
          <div className="details-meta">
            <span className="details-category">{template.category}</span>

            {template.difficulty && (
              <span className="details-difficulty">
                <Sparkles size={14} />
                {template.difficulty}
              </span>
            )}
          </div>

          <h1>{template.name}</h1>

          <p className="details-description">{template.description}</p>

          <div className="details-overview-stats">
            <div>
              <Layers3 size={18} />
              <span>
                <strong>{pages.length}</strong>
                <small>Included pages</small>
              </span>
            </div>

            <div>
              <CheckCircle2 size={18} />
              <span>
                <strong>{features.length}</strong>
                <small>Key features</small>
              </span>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-primary details-favorite-btn"
            onClick={handleFavorite}
            disabled={savingFavorite}
          >
            <Heart size={18} />
            {savingFavorite ? "Saving..." : "Save to favorites"}
          </button>

          {favoriteMessage && (
            <p className="details-feedback" role="status">
              {favoriteMessage}
            </p>
          )}
        </div>
      </section>

      {/* Detailed description */}
      <section className="details-section">
        <div className="details-section-heading">
          <span className="details-section-icon">
            <Sparkles size={20} />
          </span>
          <div>
            <h2>About this template</h2>
            <p>Discover what makes this design useful.</p>
          </div>
        </div>

        <p className="details-long-description">
          {template.longDescription || template.description}
        </p>
      </section>

      {/* Features */}
      {features.length > 0 && (
        <section className="details-section">
          <div className="details-section-heading">
            <span className="details-section-icon">
              <CheckCircle2 size={20} />
            </span>
            <div>
              <h2>Key features</h2>
              <p>Explore the main highlights of this template.</p>
            </div>
          </div>

          <div className="details-feature-grid">
            {features.map((feature, index) => (
              <article className="details-feature-card" key={feature}>
                <CheckCircle2 size={19} />
                <div>
                  <h3>Feature {index + 1}</h3>
                  <p>{feature}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Included pages */}
      {pages.length > 0 && (
        <section className="details-section">
          <div className="details-section-heading">
            <span className="details-section-icon">
              <Layers3 size={20} />
            </span>
            <div>
              <h2>Pages included</h2>
              <p>Explore the suggested website structure.</p>
            </div>
          </div>

          <div className="details-chip-list">
            {pages.map((page, index) => (
              <span className="details-page-chip" key={page}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                {page}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Use cases */}
      {useCases.length > 0 && (
        <section className="details-section">
          <div className="details-section-heading">
            <span className="details-section-icon">
              <Users size={20} />
            </span>
            <div>
              <h2>Who is this template for?</h2>
              <p>Ideas for putting this design to use.</p>
            </div>
          </div>

          <ul className="details-use-case-list">
            {useCases.map((useCase) => (
              <li key={useCase}>
                <CheckCircle2 size={18} />
                {useCase}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Technologies */}
      {techStack.length > 0 && (
        <section className="details-section">
          <div className="details-section-heading">
            <span className="details-section-icon">
              <Code2 size={20} />
            </span>
            <div>
              <h2>Technology and customization</h2>
              <p>Technologies suggested for this template.</p>
            </div>
          </div>

          <div className="details-chip-list">
            {techStack.map((technology) => (
              <span className="details-tech-chip" key={technology}>
                {technology}
              </span>
            ))}
          </div>

          <p className="details-extra-note">
            These technologies describe the suggested stack for the template.
            Actual functionality depends on your implementation.
          </p>
        </section>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <section className="details-section">
          <div className="details-section-heading">
            <span className="details-section-icon">
              <Tag size={20} />
            </span>
            <div>
              <h2>Explore the tags</h2>
              <p>Topics and characteristics associated with this design.</p>
            </div>
          </div>

          <div className="details-chip-list">
            {tags.map((tag) => (
              <span className="details-tag-chip" key={tag}>
                #{tag}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Bottom call to action */}
      <section className="details-bottom-cta">
        <div>
          <h2>Ready to explore more?</h2>
          <p>Browse the collection to find a template for your next project.</p>
        </div>

        <Link to="/templates" className="btn btn-primary">
          Explore templates
        </Link>
      </section>
    </main>
  );
}
