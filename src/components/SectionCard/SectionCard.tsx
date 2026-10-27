import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { LessonSection } from "../../features/lessons/lessonService";

export function SectionCard({ section }: { section: LessonSection }) {
  return (
    <article className={`section-card section-card--${section.tone}`} id={section.id}>
      <div className="section-card__heading">
        <span className="section-card__number">{section.number}</span>
        <img className="section-card__piece" src={`/chess-pieces/${section.piece}.svg`} alt="" loading="lazy" />
      </div>
      <h3>{section.title}</h3>
      <ul>{section.lessons.map(({ id, title }) => <li key={id}><Link to={`/lesson/${id}`}>{title}</Link></li>)}</ul>
      <Link className="section-card__link" to={`/lesson/${section.lessons[0]?.id}`}>
        Перейти до розділу <ArrowRight size={16} aria-hidden="true" />
      </Link>
    </article>
  );
}
