/** Valid keys for topics.placeholders — the 5 favpoll registers. */
export const VALID_REGISTERS = [
  "remembering",
  "celebrating_one",
  "celebrating_many",
  "cause",
  "neutral",
] as const;

export type RegisterKey = (typeof VALID_REGISTERS)[number];

/** Human-readable labels for each register shown in the admin UI. */
export const REGISTER_LABELS: Record<RegisterKey, string> = {
  remembering: "In memory of someone",
  celebrating_one: "Celebrating a person",
  celebrating_many: "Celebrating a couple / group",
  cause: "Supporting a cause",
  neutral: "Other / open",
};

export type PlaceholderEntry = { about: string; reveal: string };
export type PlaceholdersMap = Partial<Record<RegisterKey, PlaceholderEntry>>;

export type Topic = {
  id: string;
  title: string;
  is_finite: boolean;
  placeholders: PlaceholdersMap;
};
