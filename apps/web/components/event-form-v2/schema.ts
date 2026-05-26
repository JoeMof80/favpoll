import { z } from "zod"

export const eventFormSchema = z.object({
  occasion: z.string().min(1, "Please select an occasion"),
  name: z.string().min(1, "Name is required"),
  suffix: z.string().optional(),
  about: z.string().optional(),
  photo: z.instanceof(File).optional(),
  photoUrl: z.string().optional(),
  closesAt: z.date(),
  charities: z
    .array(z.string())
    .min(1, "Select at least one charity")
    .max(3, "Maximum 3 charities"),
  sharedFund: z.number().min(0),
  isPrivate: z.boolean(),
  reveal: z.string().optional(),
  topics: z
    .array(
      z.object({
        topicId: z.string(),
        title: z.string(),
        isCustom: z.boolean().default(false),
        items: z.array(z.object({ id: z.string(), label: z.string() })),
        customLabels: z.array(z.string()).default([]),
      }),
    )
    .min(1, "At least one favpoll is required"),
})

export type EventFormValues = z.infer<typeof eventFormSchema>
