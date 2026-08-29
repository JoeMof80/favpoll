import messages from "@/messages/en-GB.json"
import { t } from "@/lib/i18n"

// The share-preview copy lives in messages/en-GB.json under og.* like every
// other user-facing string; these sentences carry a name, a topic and a
// charity, and t() is a flat map, so this fills the {placeholders}.
export type OgKey = Extract<keyof typeof messages, `og.${string}`>

export function ogCopy(key: OgKey, vars: Record<string, string> = {}): string {
  return t(key).replace(/\{(\w+)\}/g, (_, name: string) => vars[name] ?? "")
}
