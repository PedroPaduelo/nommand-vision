import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { eq } from 'drizzle-orm';
import * as schema from './schema/index.js';
import { hashPassword } from '../lib/hash.js';
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });
async function seed() {
    console.log('🌱 Seeding database...');
    const passwordHash = await hashPassword('admin123');
    const [workspace] = await db
        .insert(schema.workspaces)
        .values({
        name: 'Demo Workspace',
        slug: 'demo-workspace',
        ownerId: '00000000-0000-0000-0000-000000000000',
        plan: 'free',
    })
        .returning();
    console.log(`✅ Workspace created: ${workspace.id}`);
    const [user] = await db
        .insert(schema.users)
        .values({
        workspaceId: workspace.id,
        email: 'admin@nommand.dev',
        passwordHash,
        name: 'Admin',
        onboarded: true,
        theme: 'dark',
        tourDone: false,
        plan: 'free',
        emailVerified: true,
    })
        .returning();
    console.log(`✅ User created: ${user.id} (admin@nommand.dev / admin123)`);
    await db
        .update(schema.workspaces)
        .set({ ownerId: user.id })
        .where(eq(schema.workspaces.id, workspace.id));
    const [project] = await db
        .insert(schema.projects)
        .values({
        workspaceId: workspace.id,
        name: 'Nommand Vision',
        slug: 'nommand-vision',
        description: 'Plataforma de gestão de projetos com IA',
        icon: '🚀',
        status: 'active',
        branch: 'main',
        framework: 'React',
        stack: ['TypeScript', 'Hono', 'Drizzle', 'React'],
        createdBy: user.id,
    })
        .returning();
    console.log(`✅ Project created: ${project.id}`);
    console.log('✅ Seed complete!');
}
seed().catch(console.error);
