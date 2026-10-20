import { createAdminClient } from "@/lib/supabase/admin"
import { createRegisterMirror } from "@favpoll/charity-register"

// The mirror's readers live in @favpoll/charity-register, bound here to
// THIS app's admin client. Everything else is re-exported so the import
// path every caller already uses still works.
export {
  type MirrorRow,
  type MirrorSearchResult,
  placeFromAddress,
  verificationFromRow,
} from "@favpoll/charity-register"

export const {
  otherNamesFor,
  verifyOnMirror,
  contactFromMirror,
  purposeFromMirror,
  mirrorContactAndPurpose,
  searchMirror,
  searchMirrorWithPlaceRetry,
  searchApiAsMirror,
  searchRegisterMirrorFirst,
} = createRegisterMirror(createAdminClient)
