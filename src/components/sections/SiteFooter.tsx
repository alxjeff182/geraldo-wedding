import { useWeddingContent } from "../../context/WeddingContentContext";

function GlobeIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <ellipse cx="12" cy="12" rx="4" ry="9" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 12h18" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4.5 7.5h15M4.5 16.5h15" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zm5 5.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9zm5.75-2.25a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" />
    </svg>
  );
}

export function SiteFooter() {
  const { content } = useWeddingContent();
  const { creator } = content.site;
  const websiteUrl = creator.websiteUrl ?? creator.url;
  const instagramUrl = creator.instagramUrl ?? creator.url;

  return (
    <footer className="site-footer" aria-label={content.footer.ariaLabel}>
      <p className="site-footer__line">
        {content.footer.creditPrefix}{" "}
        <a href={creator.url} target="_blank" rel="noopener noreferrer">
          {creator.name}
        </a>
      </p>
      <p className="site-footer__line">{content.footer.portfolioPrompt}</p>
      <div className="site-footer__links">
        <a
          href={websiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={content.footer.websiteAriaLabel}
        >
          <GlobeIcon />
        </a>
        <a
          href={instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={content.footer.instagramAriaLabel}
        >
          <InstagramIcon />
        </a>
      </div>
    </footer>
  );
}
