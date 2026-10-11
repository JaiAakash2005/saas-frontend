import { useEffect, useMemo, useState } from "react";
import {
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../api/axios";
import TemplateCard from "../components/TemplateCard";
import "./Templates.css";

const PAGE_SIZE = 6;

export default function Templates() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [retryCount, setRetryCount] = useState(0);
  const [templates, setTemplates] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [category, setCategory] = useState(
    searchParams.get("category") ?? "All",
  );
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [notice, setNotice] = useState("");

  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  useEffect(() => {
    let cancelled = false;

    async function fetchTemplates() {
      setLoading(true);
      setError("");

      try {
        const response = await api.get("/templates", {
          params: { page, limit: PAGE_SIZE },
        });

        if (cancelled) return;

        setTemplates(response.data.templates ?? []);
        setPagination(response.data.pagination ?? null);
      } catch (err) {
        if (cancelled) return;

        setError(
          err.response?.data?.message ||
            "We couldn't load the templates. Please try again.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchTemplates();

    return () => {
      cancelled = true;
    };
  }, [page, retryCount]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      return;
    }

    let cancelled = false;

    async function loadFavorites() {
      try {
        const response = await api.get("/favorites");

        if (!cancelled) {
          const ids = (response.data.favorites ?? [])
            .map((favorite) => {
              const template = favorite.template;

              return typeof template === "string" ? template : template?._id;
            })
            .filter(Boolean);

          setFavoriteIds(ids);
        }
      } catch {
        // Keep catalog browsing available if favorites fail to load.
      }
    }

    loadFavorites();

    return () => {
      cancelled = true;
    };
  }, []);

  const categories = useMemo(() => {
    const values = templates.map((template) => template.category);
    return ["All", ...new Set(values.filter(Boolean))];
  }, [templates]);

  const visibleTemplates = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return templates.filter((template) => {
      const matchesSearch =
        !normalizedSearch ||
        `${template.name} ${template.description} ${template.category}`
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesCategory =
        category === "All" || template.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [templates, search, category]);

  function changePage(nextPage) {
    const updated = new URLSearchParams(searchParams);
    updated.set("page", String(nextPage));
    setSearchParams(updated);
  }

  function updateSearch(value) {
    setSearch(value);

    const updated = new URLSearchParams(searchParams);
    updated.delete("page");

    if (value.trim()) {
      updated.set("search", value);
    } else {
      updated.delete("search");
    }

    setSearchParams(updated, { replace: true });
  }

  function updateCategory(value) {
    setCategory(value);

    const updated = new URLSearchParams(searchParams);
    updated.delete("page");

    if (value === "All") {
      updated.delete("category");
    } else {
      updated.set("category", value);
    }

    setSearchParams(updated);
  }

  async function handleFavorite(template) {
    setNotice("");

    if (!localStorage.getItem("token")) {
      setNotice("Please log in to save templates to your favorites.");
      return;
    }

    if (favoriteIds.includes(template._id)) {
      setNotice("This template is already in your favorites.");
      return;
    }

    try {
      await api.post(`/favorites/${template._id}`);
      setFavoriteIds((current) => [...current, template._id]);
      setNotice(`${template.name} added to favorites.`);
    } catch (err) {
      setNotice(
        err.response?.data?.message ||
          "Couldn't add this template to favorites.",
      );
    }
  }

  return (
    <main className="templates-page">
      <section className="container templates-content">
        <div className="templates-heading">
          <div>
            <span className="eyebrow">
              <SlidersHorizontal size={15} />
              Explore our collection
            </span>
            <h1 className="section-heading">Explore Templates</h1>
            <p className="section-description">
              Find the perfect starting point for your next project.
            </p>
          </div>

          <span className="template-count">
            {pagination?.totalTemplates ?? templates.length} templates
          </span>
        </div>

        <div className="catalog-toolbar">
          <label className="catalog-search">
            <Search size={18} />
            <input
              type="search"
              value={search}
              onChange={(event) => updateSearch(event.target.value)}
              placeholder="Search templates..."
              aria-label="Search templates on this page"
            />
          </label>

          <label className="category-select-label">
            <span className="visually-hidden">Filter by category</span>
            <select
              value={category}
              onChange={(event) => updateCategory(event.target.value)}
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item === "All" ? "All categories" : item}
                </option>
              ))}
            </select>
          </label>
        </div>

        {notice && (
          <p className="catalog-notice" role="status">
            {notice}
            {notice.startsWith("Please log in") && (
              <>
                {" "}
                <Link to="/login">Log in</Link>
              </>
            )}
          </p>
        )}

        {loading && (
          <div className="catalog-state" role="status">
            <span className="loading-spinner" />
            <p>Loading templates...</p>
          </div>
        )}

        {!loading && error && (
          <div className="catalog-state">
            <p>{error}</p>
            <button onClick={() => setRetryCount((prev) => prev + 1)}>
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && visibleTemplates.length > 0 && (
          <div className="template-grid">
            {visibleTemplates.map((template) => (
              <TemplateCard
                key={template._id}
                template={template}
                isFavorite={favoriteIds.includes(template._id)}
                onFavorite={handleFavorite}
              />
            ))}
          </div>
        )}

        {!loading && !error && visibleTemplates.length === 0 && (
          <div className="catalog-state">
            <h2>No templates found</h2>
            <p>Try another search term or select a different category.</p>
            <button
              className="btn btn-outline"
              onClick={() => {
                setSearch("");
                setCategory("All");
                setSearchParams({});
              }}
            >
              Clear filters
            </button>
          </div>
        )}

        {!loading && !error && pagination?.totalPages > 1 && (
          <nav className="pagination" aria-label="Template pages">
            <button
              type="button"
              className="pagination-arrow"
              disabled={!pagination.hasPrevPage}
              onClick={() => changePage(page - 1)}
              aria-label="Previous page"
            >
              <ChevronLeft size={18} />
            </button>

            {Array.from(
              { length: pagination.totalPages },
              (_, index) => index + 1,
            ).map((pageNumber) => (
              <button
                type="button"
                key={pageNumber}
                className={`pagination-number${pageNumber === page ? " active" : ""}`}
                aria-current={pageNumber === page ? "page" : undefined}
                onClick={() => changePage(pageNumber)}
              >
                {pageNumber}
              </button>
            ))}

            <button
              type="button"
              className="pagination-arrow"
              disabled={!pagination.hasNextPage}
              onClick={() => changePage(page + 1)}
              aria-label="Next page"
            >
              <ChevronRight size={18} />
            </button>
          </nav>
        )}
      </section>
    </main>
  );
}
