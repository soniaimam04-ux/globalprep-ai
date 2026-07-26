import { generateObject } from "ai"
import { z } from "zod"
import { MODEL } from "@/lib/ai"

export const maxDuration = 60

const criterion = z.object({
  score: z.number().min(1).max(9).describe("Band score for this criterion, in 0.5 increments"),
  comment: z.string().describe("One or two sentences justifying the score"),
})

const schema = z.object({
  overallBand: z.number().min(1).max(9).describe("Overall IELTS band, average of the four criteria rounded to nearest 0.5"),
  summary: z.string().describe("A short 1-2 sentence overall assessment"),
  breakdown: z.object({
    taskResponse: criterion,
    coherenceCohesion: criterion,
    lexicalResource: criterion,
    grammar: criterion,
  }),
  strengths: z.array(z.string()).min(2).max(4).describe("Specific strengths of the essay"),
  corrections: z
    .array(
      z.object({
        original: z.string().describe("The exact problematic phrase from the essay"),
        suggestion: z.string().describe("A corrected/improved version"),
        explanation: z.string().describe("Why the change improves the writing"),
      }),
    )
    .min(2)
    .max(5),
  tip: z.string().describe("One single, actionable tip to raise the band on the next essay"),
})

export async function POST(req: Request) {
  try {
    const { essay, prompt } = await req.json()

    if (!essay || typeof essay !== "string" || essay.trim().length < 40) {
      return Response.json({ error: "Please provide an essay of at least 40 characters." }, { status: 400 })
    }

    const { object } = await generateObject({
      model: MODEL,
      schema,
      system:
        "You are a certified IELTS examiner. Grade essays strictly and fairly using the official IELTS Writing Task 2 band descriptors (1-9, half-bands allowed). Be specific and constructive. Base scores only on the text provided.",
      prompt: `${prompt ? `Essay question/prompt: ${prompt}\n\n` : ""}Grade this essay:\n\n"""${essay.slice(0, 8000)}"""`,
    })

    return Response.json(object)
  } catch (err) {
    console.log("[v0] grade-essay error:", err instanceof Error ? err.message : err)
    return Response.json({ error: "Failed to grade essay. Please try again." }, { status: 500 })
  }
}
