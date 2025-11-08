import { z } from 'zod'

/**
 * Validation schema for sending messages
 */
export const sendMessageSchema = z.object({
  recipientId: z.string().min(1, 'Recipient is required'),
  subject: z
    .string()
    .max(500, 'Subject is too long (maximum 500 characters)')
    .optional()
    .or(z.literal('')),
  body: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(5000, 'Message is too long (maximum 5000 characters)'),
  conversationId: z.string().optional(),
})

export type SendMessageFormData = z.infer<typeof sendMessageSchema>

/**
 * Validation schema for file attachments
 */
export const attachmentSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 10 * 1024 * 1024, {
      message: 'File size must be less than 10MB',
    })
    .refine(
      (file) => {
        const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg']
        return allowedTypes.includes(file.type)
      },
      {
        message: 'Only PDF, PNG, and JPEG files are allowed',
      }
    ),
})

export type AttachmentFormData = z.infer<typeof attachmentSchema>
