// Stub for app/favpolls/[id]/actions — prevents Clerk server modules from
// being imported in the Storybook/Vitest browser environment.
export async function createPledge(): Promise<void> {}
export async function createGuestPledge(): Promise<string> {
  return ""
}
export async function addGuestItem(): Promise<void> {}
export async function addOrganizerItem(): Promise<void> {}
export async function removeFavpollPollFavourite(): Promise<void> {}
export async function pledgeFromFund(): Promise<void> {}
export async function topUpFund(): Promise<void> {}
