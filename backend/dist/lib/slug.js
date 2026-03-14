import { db } from '../db/index.js';
import { projects } from '../db/schema/index.js';
import { eq, and } from 'drizzle-orm';
export function toSlug(name) {
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}
export async function generateUniqueSlug(name, workspaceId) {
    const base = toSlug(name);
    let slug = base;
    let suffix = 1;
    while (true) {
        const [existing] = await db
            .select({ id: projects.id })
            .from(projects)
            .where(and(eq(projects.workspaceId, workspaceId), eq(projects.slug, slug)))
            .limit(1);
        if (!existing)
            return slug;
        slug = `${base}-${suffix++}`;
    }
}
