// PROTOTYPE — the extended creation wizard (2026-08-31). Throwaway; see
// NOTES.md beside this file. Real data, real components, no publishing.
import { getWizardData } from "@/app/favpolls/new/wizard-data"
import { WizardPrototype } from "./wizard-prototype"

export default async function ExtendedWizardPrototypePage() {
  const data = await getWizardData()
  return <WizardPrototype data={data} />
}
