## 2025-05-15 - [Anti-pattern] Sequential API fetching in analysis loops
**Learning:** Several routes in the codebase (specifically `analysis.ts`) were fetching match details sequentially within a `for` loop. Given Riot API latency (~200-500ms per call), fetching 20 matches sequentially could block the request for up to 10 seconds.
**Action:** Use batched `Promise.all` for all match detail lookups. A batch size of 5-10 is safe for standard Riot API keys to avoid overwhelming the rate limiter while still providing ~5-10x speedup.
