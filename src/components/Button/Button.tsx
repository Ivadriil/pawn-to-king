import type { ReactNode } from "react";
import { Link } from "react-router-dom";

type Props = { to: string; variant: "primary" | "outline"; icon?: ReactNode; children: ReactNode };

export function Button({ to, variant, icon, children }: Props) {
  return <Link className={`button button--${variant}`} to={to}>{icon}{children}</Link>;
}
