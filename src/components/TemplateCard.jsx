import { Heart, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import "./TemplateCard.css";

export default function TemplateCard({
  template,
  isFavorite = false,
  onFavorite,
}) {
  const { _id, name, description, thumbnail_url, category } = template;

  const handleFavoriteClick = () => {
    if (onFavorite) {
      onFavorite(template);
    }
  };

  return (
    <article className="template-card">
      <Link
        to={`/templates/${_id}`}
        className="template-card-preview"
        aria-label={`View ${name} details`}
      >
        <img
          src={thumbnail_url}
          alt={`${name} template preview`}
          loading="lazy"
        />
        <span className="template-preview-action">
          View details <ArrowUpRight size={15} />
        </span>
      </Link>

      <div className="template-card-body">
        <div className="template-card-heading">
          <div className="template-card-title-group">
            <span className="template-category">{category}</span>
            <h3 className="template-card-title">
              <Link to={`/templates/${_id}`}>{name}</Link>
            </h3>
          </div>

          <button
            type="button"
            className={`favorite-button${isFavorite ? " is-favorite" : ""}`}
            onClick={handleFavoriteClick}
            aria-label={
              isFavorite
                ? `Remove ${name} from favorites`
                : `Add ${name} to favorites`
            }
            aria-pressed={isFavorite}
            disabled={!onFavorite}
            title={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart size={19} fill={isFavorite ? "currentColor" : "none"} />
          </button>
        </div>

        <p className="template-card-description">{description}</p>
      </div>
    </article>
  );
}
