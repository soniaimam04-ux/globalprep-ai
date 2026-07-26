import { generateObject } from "ai"
import { z } from "zod"
import { MODEL, aiErrorResponse } from "@/lib/ai"

export const maxDuration = 60

const schema = z.object({
  words: z
    .array(
      z.object({
        word: z.string(),
        partOfSpeech: z.string().describe("e.g. noun, verb, adjective"),
        definition: z.string().describe("Clear, student-friendly definition"),
        example: z.string().describe("A natural example sentence using the word"),
        synonyms: z.array(z.string()).min(1).max(4),
      }),
    )
    .min(5)
    .max(10),
})

export async function POST(req: Request) {
  try {
    const { level, count, seed } = await req.json()
    const n = Math.min(Math.max(Number(count) || 6, 5), 10)

    const { object } = await generateObject({
      model: MODEL,
      schema,
      temperature: 0.9,
      system:
        "You are a vocabulary coach for IELTS/TOEFL students. Choose useful, high-frequency academic and exam-relevant words. Avoid overly obscure terms unless the level is Advanced.",
      prompt: `Generate ${n} distinct ${level || "Intermediate"}-level English vocabulary words suitable for IELTS/TOEFL preparation. Provide variety and avoid the most common everyday words. Randomization token: ${seed || Date.now()}.`,
    })

    return Response.json(object)
  } catch (err) {
    return aiErrorResponse(err, "Failed to generate vocabulary. Please try again.")
  }
}
