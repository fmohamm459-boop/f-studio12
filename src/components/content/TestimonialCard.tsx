type TestimonialCardProps = {
  quote: string;
  author: string;
  role: string;
  rating: number;
  featured?: boolean;
};

/**
 * Testimonial Card (Page_Structure PART D "Content"). Rating is conveyed as
 * accessible text ("4.8 out of 5"), never by star color alone, consistent
 * with the "never color alone" rule applied throughout (§15.3/§19.3).
 */
export function TestimonialCard({ quote, author, role, rating, featured = false }: TestimonialCardProps) {
  return (
    <figure
      className={`flex h-full flex-col justify-between rounded-[var(--radius-lg)] border border-border bg-surface-elevated ${
        featured ? "p-10" : "p-6"
      }`}
    >
      <blockquote>
        <p
          className={`text-pretty leading-relaxed text-foreground ${
            featured ? "text-xl" : "text-sm"
          }`}
        >
          &ldquo;{quote}&rdquo;
        </p>
      </blockquote>
      <figcaption className="mt-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-foreground">{author}</p>
          <p className="text-xs text-foreground/60">{role}</p>
        </div>
        <span className="numeral-ltr font-mono text-xs text-foreground/70">
          {rating.toFixed(1)}/5
        </span>
      </figcaption>
    </figure>
  );
}
