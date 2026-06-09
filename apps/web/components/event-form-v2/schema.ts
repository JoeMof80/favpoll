import { z } from "zod"

export const eventFormSchema = z.object({
  register: z.string().optional().default(""),
  occasionType: z.string().min(1, "Please select an occasion type"),
  openingLine: z.string().max(50, "Must be 50 characters or fewer").optional(),
  name: z
    .string()
    .min(1, "Name is required")
    .max(40, "Name must be 40 characters or fewer"),
  context: z.string().max(40, "Must be 40 characters or fewer").optional(),
  about: z.string().max(300, "Must be 300 characters or fewer").optional(),
  photo: z.instanceof(File).optional(),
  photoUrl: z.string().optional(),
  closesAt: z.date(),
  charities: z
    .array(z.string())
    .min(1, "Select at least one charity")
    .max(3, "Maximum 3 charities"),
  sharedFund: z.number().min(0),
  isPrivate: z.boolean(),
  isPlural: z.boolean().default(false),
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

export type EventFormValues = z.infer<typeof eventFormSchema>
