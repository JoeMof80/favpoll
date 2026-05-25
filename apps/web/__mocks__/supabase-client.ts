export function createClient() {
  return {
    channel: () => ({
      on: () => ({ subscribe: () => {} }),
      subscribe: () => {},
    }),
    removeChannel: () => {},
    from: () => ({
      select: () => ({ eq: () => ({ data: [], error: null }) }),
    }),
  }
}
