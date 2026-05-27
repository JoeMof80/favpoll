export const VALID_OCCASIONS = [
  "memorial",
  "tribute",
  "birthday",
  "retirement",
  "wedding",
  "engagement",
  "anniversary",
  "leaving",
  "graduation",
  "christening",
  "achievement",
  "recovery",
  "award",
  "promotion",
  "celebration",
  "other",
  "default",
] as const;

export type Occasion = (typeof VALID_OCCASIONS)[number];

export type PlaceholderEntry = { about: string; reveal: string };
export type PlaceholdersMap = Record<string, PlaceholderEntry>;

export type Topic = {
  id: string;
  title: string;
  is_finite: boolean;
  placeholders: PlaceholdersMap;
};
