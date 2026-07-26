import { generateObject } from "ai"
import { z } from "zod"
import { MODEL, aiErrorResponse } from "@/lib/ai"

export const maxDuration = 60

const schema = z.object({
  scholarships: z
    .array(
      z.object({
        name: z.string().describe("Official scholarship name"),
        provider: z.string().describe("Sponsoring organization, government, or university"),
        country: z.string().describe("Host country / region"),
        level: z.string().describe("Study level, e.g. Undergraduate, Master's, PhD"),
        coverage: z.string().describe("What it funds, e.g. Full tuition + stipend, Partial"),
        typicalDeadline: z.string().describe("Typical application window, e.g. 'October-December'"),
        matchStrength: z.enum(["High", "Medium", "Emerging"]).describe("How well it fits the profile"),
        eligibility: z.string().describe("Key eligibility requirements in one sentence"),
        matchReason: z.string().describe("Why this fits THIS student's specific profile"),
        officialSearchHint: z.string().describe("What to search to find the official page"),
      }),
    )
    .min(5)
    .max(8),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { field, level, gpa, examType, examScore, country, financialNeed } = body

    if (!field) {
      return Response.json({ error: "Field of study is required." }, { status: 400 })
    }

    const { object } = await generateObject({
      model: MODEL,
      schema,
      system:
        "You are an expert study-abroad and scholarship advisor. Recommend only REAL, well-known scholarships that actually exist (e.g. Chevening, Fulbright, DAAD, Erasmus Mundus, Australia Awards, university-specific awards). Never invent fake programs. Tailor eligibility reasoning to the student's exact profile. If a profile is weak for a program, still explain honestly.",
      prompt: `Recommend 5-8 real scholarships for this student.
Field of study: ${field}
Target level: ${level || "not specified"}
GPA: ${gpa || "not specified"}
English exam: ${examType || "not specified"} (score: ${examScore || "not specified"})
Preferred country/region: ${country || "open to any"}
Financial need: ${financialNeed || "not specified"}

Prioritize scholarships the student is genuinely competitive for and that match the country and field. Order from best match to emerging match.`,
    })

    return Response.json(object)
  } catch (err) {
    return aiErrorResponse(err, "Failed to match scholarships. Please try again.")
  }
}
