import { ArrowRight, Search, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import "./Home.css";

const categories = [
  "All",
  "Portfolio",
  "Business",
  "Resume",
  "E-commerce",
  "Blog",
];

const stats = [
  { value: "35+", label: "Templates" },
  { value: "5+", label: "Categories" },
  { value: "Free", label: "Template styles" },
];

export default function Home() {
  return (
    <>
      <main>
        <section className="hero-section">
          <div className="container hero-layout">
            <div className="hero-copy">
              <span className="eyebrow">
                <Sparkles size={15} />
                Your next project starts here
              </span>

              <h1>
                Beautiful Templates
                <br />
                for Your <span>Next Idea</span>
              </h1>

              <p className="hero-description">
                Discover, explore, and save stunning templates for portfolios,
                businesses, resumes, and more.
              </p>

              <form
                className="hero-search"
                onSubmit={(event) => {
                  event.preventDefault();
                  const query = new FormData(event.currentTarget)
                    .get("search")
                    .toString()
                    .trim();

                  const searchParams = new URLSearchParams();

                  if (query) {
                    searchParams.set("search", query);
                  }

                  window.location.href = `/templates?${searchParams.toString()}`;
                }}
              >
                <Search size={19} aria-hidden="true" />
                <input
                  type="search"
                  name="search"
                  placeholder="Search templates..."
                  aria-label="Search templates"
                />
                <button type="submit" aria-label="Search">
                  <Search size={19} />
                </button>
              </form>

              <div className="hero-categories" aria-label="Browse categories">
                {categories.map((category) => (
                  <Link
                    key={category}
                    to={
                      category === "All"
                        ? "/templates"
                        : `/templates?category=${encodeURIComponent(category)}`
                    }
                    className={`category-chip${category === "All" ? " selected" : ""}`}
                  >
                    {category}
                  </Link>
                ))}
              </div>

              <Link to="/templates" className="hero-cta">
                Explore templates <ArrowRight size={17} />
              </Link>
            </div>

            <div className="hero-visual" aria-label="Template previews">
              <div className="preview-window preview-window-back">
                <div className="preview-topbar">
                  <span />
                  <span />
                  <span />
                </div>
                <div className="preview-content preview-business">
                  <span className="preview-label">CREATIVE STUDIO</span>
                  <strong>Build something amazing.</strong>
                  <div className="preview-line" />
                  <div className="preview-blocks">
                    <span />
                    <span />
                  </div>
                </div>
              </div>

              <div className="preview-window preview-window-front">
                <div className="preview-topbar">
                  <span />
                  <span />
                  <span />
                </div>
                <div className="preview-content preview-portfolio">
                  <span className="preview-label">PERSONAL PORTFOLIO</span>
                  <strong>Ideas into reality.</strong>
                  <p>Design. Build. Create.</p>
                  <span className="preview-button">View my work ↗</span>
                </div>
              </div>

              <div className="floating-badge">
                <span className="floating-badge-icon">
                  <Sparkles size={19} />
                </span>
                <span>
                  <strong>Made for creators</strong>
                  <small>Find your next starting point</small>
                </span>
              </div>

              <div className="hero-decoration hero-decoration-one" />
              <div className="hero-decoration hero-decoration-two" />
            </div>
          </div>
        </section>

        <section className="stats-section" aria-label="TemplateHub highlights">
          <div className="container stats-grid">
            {stats.map(({ value, label }) => (
              <div className="stat-item" key={label}>
                <strong>{value}</strong>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="section home-explore">
          <div className="container explore-panel">
            <div>
              <span className="eyebrow">
                <Sparkles size={15} />
                Start exploring
              </span>
              <h2 className="section-heading">
                Find the right template for your next idea.
              </h2>
              <p className="section-description">
                Browse our growing collection and save your favorites.
              </p>
            </div>
            <Link to="/templates" className="btn btn-primary">
              Browse templates <ArrowRight size={17} />
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
