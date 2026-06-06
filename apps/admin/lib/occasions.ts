/** Valid occasion_type keys for topics.placeholders. */
export const VALID_OCCASION_TYPES = [
  "Memorial",
  "Tribute",
  "Birthday",
  "Retirement",
  "Leaving do",
  "Graduation",
  "Christening",
  "Achievement",
  "Recovery",
  "Award",
  "Promotion",
  "Wedding",
  "Engagement",
  "Anniversary",
  "default",
] as const;

export type OccasionType = (typeof VALID_OCCASION_TYPES)[number];

export type PlaceholderEntry = { about: string; reveal: string };
export type PlaceholdersMap = Record<string, PlaceholderEntry>;

export type Topic = {
  id: string;
  title: string;
  is_finite: boolean;
  placeholders: PlaceholdersMap;
};
