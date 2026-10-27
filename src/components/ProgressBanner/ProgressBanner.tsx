import { Trophy } from "lucide-react";
import "./ProgressBanner.scss";

type ProgressBannerProps = { completedCount: number; totalCount: number; stars: number };
export function ProgressBanner({ completedCount, totalCount, stars }: ProgressBannerProps) {
  const safeTotal = Math.max(totalCount, 0);
  const safeCompleted = Math.min(Math.max(completedCount, 0), safeTotal);
  const percent = safeTotal === 0 ? 0 : (safeCompleted / safeTotal) * 100;
  const hint = safeCompleted === 0 ? "Поки що немає завершених тем. Почни навчання!" : `Завершено тем: ${safeCompleted}. Так тримати!`;
  return <section className="progress-banner">
    <div className="progress-banner__icon"><Trophy size={24} /></div>
    <div className="progress-banner__text"><strong>Твій прогрес</strong><span>{hint}</span></div>
    <div className="progress-banner__bar" role="progressbar" aria-label="Завершені уроки" aria-valuenow={safeCompleted} aria-valuemax={safeTotal}><div className="progress-banner__fill" style={{ width: `${percent}%` }} /></div>
    <span className="progress-banner__count">{safeCompleted} / {safeTotal}</span>
    <span className="progress-banner__stars" aria-label={`${stars} зірок`}>★ {stars}</span>
  </section>;
}
