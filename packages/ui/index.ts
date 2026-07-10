export { ThemeProvider } from "./src/theme-provider";
export { MenuButton } from "./src/menu-button";
// Re-export so app code shares the SAME next-themes instance (and React
// context) as ThemeProvider — a second copy makes setTheme a silent no-op.
export { useTheme } from "next-themes";
