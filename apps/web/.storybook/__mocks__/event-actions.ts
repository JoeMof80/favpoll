// Stub for app/events/[id]/actions — prevents Clerk server modules from
// being imported in the Storybook/Vitest browser environment.
export async function createPledge(): Promise<void> {}
export async function createGuestPledge(): Promise<string> { return "" }
export async function addGuestItem(): Promise<void> {}
export async function removeEventPollItem(): Promise<void> {}
export async function pledgeFromFund(): Promise<void> {}
export async function topUpFund(): Promise<void> {}
