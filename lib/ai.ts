// Central model config for all AI features. Uses the Vercel AI Gateway
// (zero-config in v0) with a current Google Gemini model.
export const MODEL = "google/gemini-3.5-flash"

// Turns an AI SDK / Gateway error into a user-facing message + status.
// Surfaces actionable Gateway messages (e.g. billing) instead of a generic error.
export function aiErrorResponse(err: unknown, fallback: string) {
  const message = err instanceof Error ? err.message : String(err)
  console.log("[v0] AI error:", message)

  if (/credit card|billing|payment/i.test(message)) {
    return Response.json(
      {
        error:
          "AI is not enabled yet: the Vercel AI Gateway needs a credit card on file to unlock the free credits. Add one in your Vercel dashboard under AI, then try again.",
      },
      { status: 402 },
    )
  }

  if (/rate limit|quota|429/i.test(message)) {
    return Response.json({ error: "AI is temporarily rate limited. Please wait a moment and try again." }, { status: 429 })
  }

  return Response.json({ error: fallback }, { status: 500 })
}
