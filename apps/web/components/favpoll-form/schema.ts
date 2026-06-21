import { z } from "zod"

export const eventFormSchema = z
  .object({
    register: z.string().optional().default(""),
    category: z.enum(["celebration", "memorial", "fundraiser"]).optional(),
    grouping: z.enum(["individual", "couple", "group"]).default("individual"),
    subject: z.enum(["someone", "cause"]).default("someone"),
    openingLine: z
      .string()
      .max(50, "Must be 50 characters or fewer")
      .optional(),
    name: z.string().max(40, "Name must be 40 characters or fewer").optional(),
    causeLabel: z.string().max(60, "Must be 60 characters or fewer").optional(),
    context: z.string().max(40, "Must be 40 characters or fewer").optional(),
    about: z.string().max(300, "Must be 300 characters or fewer").optional(),
    photo: z.instanceof(File).optional(),
    photoUrl: z.string().optional(),
    charities: z
      .array(z.string())
      .min(1, "Select at least one charity")
      .max(3, "Maximum 3 charities"),
    isListed: z.boolean().default(true),
    reveal: z.string().max(280, "Must be 280 characters or fewer").optional(),
    topics: z
      .array(
        z.object({
          topicId: z.string(),
          title: z.string(),
          isCustom: z.boolean().default(false),
          items: z.array(z.object({ id: z.string(), label: z.string() })),
          customLabels: z.array(z.string().max(50)).default([]),
        })
      )
      .min(1, "At least one favpoll is required"),
  })
  .superRefine((data, ctx) => {
    if (
      data.subject === "someone" &&
      (!data.name || data.name.trim().length === 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["name"],
        message: "Name is required",
      })
    }
    if (
      data.subject === "cause" &&
      (!data.causeLabel || data.causeLabel.trim().length === 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["causeLabel"],
        message: "Please describe what you're raising for",
      })
    }
  })

export type FavpollFormValues = z.infer<typeof eventFormSchema>
