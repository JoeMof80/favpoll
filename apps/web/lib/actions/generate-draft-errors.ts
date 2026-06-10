export class RateLimitError extends Error {
  constructor() {
    super("Rate limit exceeded — try again in a few minutes.")
    this.name = "RateLimitError"
  }
}
