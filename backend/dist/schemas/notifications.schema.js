import { z } from 'zod';
export const notificationTypes = ['deploy', 'agent', 'system', 'alert', 'billing'];
export const listNotificationsSchema = z.object({
    read: z.enum(['true', 'false']).optional(),
    type: z.enum(notificationTypes).optional(),
    page: z.coerce.number().min(1).default(1),
    perPage: z.coerce.number().min(1).max(50).default(20),
});
export const createNotificationSchema = z.object({
    userId: z.string().uuid(),
    workspaceId: z.string().uuid(),
    type: z.enum(notificationTypes),
    title: z.string().min(1).max(200),
    body: z.string().optional(),
    channel: z.enum(['in_app', 'email', 'push']).default('in_app'),
    link: z.string().max(500).optional(),
});
export const updatePreferencesSchema = z.object({
    type: z.string().min(1).max(50),
    inApp: z.boolean().default(true),
    email: z.boolean().default(false),
    push: z.boolean().default(false),
});
