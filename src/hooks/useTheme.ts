import { useEffect, useState } from "react";

type Theme = "light" | "dark";

function readTheme(): Theme {
  try {
    return localStorage.getItem("chess-theme") === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(readTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("chess-theme", theme);
    } catch {
      // The selected theme still applies when browser storage is unavailable.
    }
  }, [theme]);

  return {
    theme,
    toggleTheme: () => setTheme((current) => (current === "light" ? "dark" : "light")),
  };
}
