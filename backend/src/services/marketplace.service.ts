import { db } from '../db/index.js'
import { marketplaceItems, marketplaceInstalls } from '../db/schema/marketplace.js'
import { eq, and, desc, sql, ilike, or } from 'drizzle-orm'
import type { ListMarketplaceInput, InstallItemInput, RateItemInput } from '../schemas/marketplace.schema.js'

export async function listItems(workspaceId: string, input: ListMarketplaceInput) {
  const conditions: any[] = [eq(marketplaceItems.published, true)]

  if (input.category) {
    conditions.push(eq(marketplaceItems.category, input.category))
  }

  if (input.search) {
    conditions.push(
      or(
        ilike(marketplaceItems.name, `%${input.search}%`),
        ilike(marketplaceItems.description, `%${input.search}%`)
      )
    )
  }

  const offset = (input.page - 1) * input.perPage

  let orderBy = desc(marketplaceItems.createdAt)
  if (input.sort === 'name') {
    orderBy = desc(marketplaceItems.name) as any
  } else if (input.sort === 'downloads') {
    orderBy = desc(marketplaceItems.downloads) as any
  } else if (input.sort === 'rating') {
    orderBy = desc(marketplaceItems.rating) as any
  }

  const data = await db
    .select()
    .from(marketplaceItems)
    .where(and(...conditions))
    .orderBy(orderBy)
    .limit(input.perPage)
    .offset(offset)

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(marketplaceItems)
    .where(and(...conditions))

  const installedIds = await db
    .select({ itemId: marketplaceInstalls.itemId })
    .from(marketplaceInstalls)
    .where(eq(marketplaceInstalls.workspaceId, workspaceId))
    .then(rows => rows.map(r => r.itemId))

  return {
    data: data.map(item => ({
      ...formatItem(item),
      installed: installedIds.includes(item.id),
    })),
    meta: {
      total: Number(count),
      page: input.page,
      perPage: input.perPage,
    },
  }
}

export async function getItem(id: string, workspaceId: string) {
  const [item] = await db
    .select()
    .from(marketplaceItems)
    .where(eq(marketplaceItems.id, id))
    .limit(1)

  if (!item) {
    throw new Error('Item not found')
  }

  const [install] = await db
    .select()
    .from(marketplaceInstalls)
    .where(
      and(
        eq(marketplaceInstalls.workspaceId, workspaceId),
        eq(marketplaceInstalls.itemId, id)
      )
    )
    .limit(1)

  const [{ installCount }] = await db
    .select({ installCount: sql<number>`count(*)` })
    .from(marketplaceInstalls)
    .where(eq(marketplaceInstalls.itemId, id))

  return {
    ...formatItem(item),
    installCount: Number(installCount),
    installed: !!install,
    userConfig: install?.config || null,
  }
}

export async function installItem(workspaceId: string, itemId: string, userId: string, input: InstallItemInput) {
  const [item] = await db
    .select()
    .from(marketplaceItems)
    .where(eq(marketplaceItems.id, itemId))
    .limit(1)

  if (!item) {
    throw new Error('Item not found')
  }

  const [existing] = await db
    .select()
    .from(marketplaceInstalls)
    .where(
      and(
        eq(marketplaceInstalls.workspaceId, workspaceId),
        eq(marketplaceInstalls.itemId, itemId)
      )
    )
    .limit(1)

  if (existing) {
    await db
      .update(marketplaceInstalls)
      .set({ config: input.config })
      .where(eq(marketplaceInstalls.id, existing.id))

    return { success: true, reinstalled: false }
  }

  await db.insert(marketplaceInstalls).values({
    workspaceId,
    itemId,
    config: input.config,
    installedBy: userId,
  })

  await db
    .update(marketplaceItems)
    .set({ downloads: sql`${marketplaceItems.downloads} + 1` })
    .where(eq(marketplaceItems.id, itemId))

  return { success: true, installed: true }
}

export async function uninstallItem(workspaceId: string, itemId: string) {
  const [install] = await db
    .delete(marketplaceInstalls)
    .where(
      and(
        eq(marketplaceInstalls.workspaceId, workspaceId),
        eq(marketplaceInstalls.itemId, itemId)
      )
    )
    .returning()

  if (!install) {
    throw new Error('Installation not found')
  }

  return { success: true }
}

export async function listInstalled(workspaceId: string) {
  const data = await db
    .select({
      id: marketplaceInstalls.id,
      itemId: marketplaceInstalls.itemId,
      config: marketplaceInstalls.config,
      installedAt: marketplaceInstalls.installedAt,
    })
    .from(marketplaceInstalls)
    .where(eq(marketplaceInstalls.workspaceId, workspaceId))

  const items = await Promise.all(
    data.map(async (install) => {
      const [item] = await db
        .select()
        .from(marketplaceItems)
        .where(eq(marketplaceItems.id, install.itemId))
        .limit(1)
      return item ? { ...formatItem(item), installConfig: install.config, installedAt: install.installedAt } : null
    })
  )

  return items.filter(Boolean)
}

export async function rateItem(workspaceId: string, itemId: string, input: RateItemInput) {
  const [item] = await db
    .select()
    .from(marketplaceItems)
    .where(eq(marketplaceItems.id, itemId))
    .limit(1)

  if (!item) {
    throw new Error('Item not found')
  }

  const currentRating = item.rating ? Number(item.rating) : 0
  const newRating = (currentRating + input.rating) / 2

  await db
    .update(marketplaceItems)
    .set({ rating: newRating.toFixed(2) })
    .where(eq(marketplaceItems.id, itemId))

  return { success: true, rating: newRating }
}

function formatItem(item: typeof marketplaceItems.$inferSelect) {
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    author: item.author,
    category: item.category,
    iconUrl: item.iconUrl,
    bannerUrl: item.bannerUrl,
    version: item.version,
    downloads: item.downloads,
    rating: item.rating,
    tags: item.tags,
    configSchema: item.configSchema,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }
}
