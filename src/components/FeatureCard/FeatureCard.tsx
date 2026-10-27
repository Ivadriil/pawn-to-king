import type { ReactNode } from "react";

type Props = { accent: string; icon: ReactNode; title: string; description: string };

export function FeatureCard({ accent, icon, title, description }: Props) {
  return <article className={`feature-card feature-card--${accent}`}><div className="feature-card__icon">{icon}</div><h3>{title}</h3><p>{description}</p></article>;
}
