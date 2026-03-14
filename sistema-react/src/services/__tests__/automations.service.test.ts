import { getWorkflows, createWorkflow, toggleWorkflow, deleteWorkflow } from '../automations.service'

describe('automations.service', () => {
  it('getWorkflows returns array of workflows', async () => {
    const result = await getWorkflows()
    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBeGreaterThan(0)
    expect(result[0]).toHaveProperty('id')
    expect(result[0]).toHaveProperty('name')
    expect(result[0]).toHaveProperty('type')
    expect(result[0]).toHaveProperty('active')
    expect(result[0]).toHaveProperty('steps')
    expect(result[0]).toHaveProperty('executions')
    expect(result[0]).toHaveProperty('successRate')
  })

  it('createWorkflow returns a new workflow', async () => {
    const created = await createWorkflow({ name: 'Test Workflow', type: 'Custom' })
    expect(created).toBeDefined()
    expect(created.name).toBe('Test Workflow')
    expect(created.type).toBe('Custom')
    expect(created.active).toBe(true)
    expect(created.executions).toBe(0)
  })

  it('createWorkflow uses defaults for missing fields', async () => {
    const created = await createWorkflow({})
    expect(created.name).toBe('New Workflow')
    expect(created.type).toBe('Custom')
    expect(created.steps).toEqual([])
  })

  it('toggleWorkflow flips active state', async () => {
    const workflows = await getWorkflows()
    const target = workflows[0]
    const originalActive = target.active
    const toggled = await toggleWorkflow(target.id)
    expect(toggled).toBeDefined()
    expect(toggled?.active).toBe(!originalActive)
  })

  it('toggleWorkflow returns undefined for non-existent id', async () => {
    const result = await toggleWorkflow('non-existent')
    expect(result).toBeUndefined()
  })

  it('deleteWorkflow removes workflow and returns true', async () => {
    const workflows = await getWorkflows()
    const last = workflows[workflows.length - 1]
    const result = await deleteWorkflow(last.id)
    expect(result).toBe(true)
    const after = await getWorkflows()
    expect(after.find(w => w.id === last.id)).toBeUndefined()
  })

  it('deleteWorkflow returns false for non-existent id', async () => {
    const result = await deleteWorkflow('non-existent')
    expect(result).toBe(false)
  })
})
