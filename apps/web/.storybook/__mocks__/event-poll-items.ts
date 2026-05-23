// Stub for lib/actions/event-poll-items — prevents Clerk/Supabase server
// modules from being imported in the Storybook/Vitest browser environment.
export async function hideEventPollItem(_id: string): Promise<void> {}
export async function showEventPollItem(_id: string): Promise<void> {}
