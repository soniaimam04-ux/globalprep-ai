import { generateObject } from "ai"
import { z } from "zod"
import { MODEL } from "@/lib/ai"

export const maxDuration = 60

const schema = z.object({
  passage: z
    .string()
    .describe("For reading comprehension only: a short passage (120-200 words). Empty string otherwise.")
    .optional(),
  questions: z
    .array(
      z.object({
        question: z.string(),
        options: z.array(z.string()).length(4),
        answerIndex: z.number().min(0).max(3).describe("Index of the correct option"),
        explanation: z.string().describe("Why the answer is correct"),
      }),
    )
    .min(4)
    .max(10),
})

export async function POST(req: Request) {
  try {
    const { examType, category, difficulty, count } = await req.json()
    const n = Math.min(Math.max(Number(count) || 5, 4), 10)

    const categoryInstruction =
      category === "reading"
        ? `Write ONE short reading passage appropriate for ${examType}, then create ${n} reading-comprehension multiple-choice questions about it.`
        : category === "grammar"
          ? `Create ${n} grammar multiple-choice questions (error identification, tense, prepositions, articles, sentence structure). Leave passage empty.`
          : `Create ${n} vocabulary multiple-choice questions (word meaning, collocations, synonyms in context). Leave passage empty.`

    const { object } = await generateObject({
      model: MODEL,
      schema,
      system:
        "You are an expert English test-prep item writer for IELTS and TOEFL. Write clear, unambiguous multiple-choice questions with exactly one correct answer and plausible distractors. Match the requested difficulty precisely.",
      prompt: `Exam: ${examType || "IELTS"}. Difficulty: ${difficulty || "Intermediate"}.\n${categoryInstruction}`,
    })

    return Response.json(object)
  } catch (err) {
    console.log("[v0] practice error:", err instanceof Error ? err.message : err)
    return Response.json({ error: "Failed to generate questions. Please try again." }, { status: 500 })
  }
}
