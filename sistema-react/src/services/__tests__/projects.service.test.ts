import { getProjects, getProjectBySlug, createProject } from '../projects.service'

describe('projects.service', () => {
  it('getProjects returns array of projects for Frontend role', async () => {
    const result = await getProjects('Frontend')
    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBeGreaterThan(0)
    expect(result[0]).toHaveProperty('id')
    expect(result[0]).toHaveProperty('name')
    expect(result[0]).toHaveProperty('status')
    expect(result[0]).toHaveProperty('stack')
    expect(result[0]).toHaveProperty('role')
  })

  it('getProjects returns different projects per role', async () => {
    const frontend = await getProjects('Frontend')
    const backend = await getProjects('Backend')
    expect(frontend[0].role).toBe('Frontend')
    expect(backend[0].role).toBe('Backend')
    expect(frontend[0].id).not.toBe(backend[0].id)
  })

  it('getProjects defaults to Frontend for unknown role', async () => {
    const result = await getProjects('Unknown')
    expect(result.length).toBeGreaterThan(0)
    expect(result[0].role).toBe('Frontend')
  })

  it('getProjectBySlug returns a matching project', async () => {
    const project = await getProjectBySlug('landing-page-v2')
    expect(project).toBeDefined()
    expect(project?.name).toBe('Landing Page v2')
  })

  it('getProjectBySlug returns undefined for non-existent slug', async () => {
    const project = await getProjectBySlug('non-existent-project')
    expect(project).toBeUndefined()
  })

  it('createProject returns a new project with given data', async () => {
    const created = await createProject({ name: 'Test Project', role: 'Frontend' })
    expect(created).toBeDefined()
    expect(created.name).toBe('Test Project')
    expect(created.id).toContain('custom-')
    expect(created.status).toBe('active')
    expect(created.commits).toBe(0)
    expect(created.deploys).toBe(0)
    expect(created.role).toBe('Frontend')
  })

  it('createProject uses default values when data is sparse', async () => {
    const created = await createProject({})
    expect(created.name).toBe('New Project')
    expect(created.branch).toBe('main')
    expect(created.framework).toBe('Next.js 14')
  })
})
