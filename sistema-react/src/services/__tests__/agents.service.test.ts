import { getAgents, getAgentById, createAgent, startAgent, stopAgent, deleteAgent } from '../agents.service'

describe('agents.service', () => {
  it('getAgents returns array of agents', async () => {
    const result = await getAgents()
    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBeGreaterThan(0)
    expect(result[0]).toHaveProperty('id')
    expect(result[0]).toHaveProperty('name')
    expect(result[0]).toHaveProperty('status')
    expect(result[0]).toHaveProperty('model')
    expect(result[0]).toHaveProperty('type')
    expect(result[0]).toHaveProperty('tasks')
  })

  it('getAgentById returns a specific agent', async () => {
    const agents = await getAgents()
    const agent = await getAgentById(agents[0].id)
    expect(agent).toBeDefined()
    expect(agent?.id).toBe(agents[0].id)
    expect(agent?.name).toBe(agents[0].name)
  })

  it('getAgentById returns undefined for non-existent id', async () => {
    const agent = await getAgentById('non-existent')
    expect(agent).toBeUndefined()
  })

  it('createAgent returns a new agent with given data', async () => {
    const created = await createAgent({ name: 'Test Agent', type: 'Custom', model: 'GPT-4' })
    expect(created).toBeDefined()
    expect(created.name).toBe('Test Agent')
    expect(created.type).toBe('Custom')
    expect(created.model).toBe('GPT-4')
    expect(created.id).toContain('ag-')
    expect(created.status).toBe('idle')
    expect(created.tasks).toBe(0)
  })

  it('createAgent uses defaults for missing fields', async () => {
    const created = await createAgent({})
    expect(created.name).toBe('New Agent')
    expect(created.model).toBe('GPT-4 Turbo')
    expect(created.type).toBe('Custom')
  })

  it('startAgent sets status to running', async () => {
    const agents = await getAgents()
    const idle = agents.find(a => a.status === 'idle' || a.status === 'stopped')
    if (!idle) return
    const started = await startAgent(idle.id)
    expect(started).toBeDefined()
    expect(started?.status).toBe('running')
  })

  it('stopAgent sets status to stopped', async () => {
    const agents = await getAgents()
    const running = agents.find(a => a.status === 'running')
    if (!running) return
    const stopped = await stopAgent(running.id)
    expect(stopped).toBeDefined()
    expect(stopped?.status).toBe('stopped')
  })

  it('deleteAgent removes agent and returns true', async () => {
    const agents = await getAgents()
    const last = agents[agents.length - 1]
    const result = await deleteAgent(last.id)
    expect(result).toBe(true)
    const after = await getAgents()
    expect(after.find(a => a.id === last.id)).toBeUndefined()
  })

  it('deleteAgent returns false for non-existent id', async () => {
    const result = await deleteAgent('non-existent')
    expect(result).toBe(false)
  })
})
