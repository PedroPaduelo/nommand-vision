import { getDeploys, getDeployById, cancelDeploy, rollbackDeploy } from '../deploys.service'

describe('deploys.service', () => {
  it('getDeploys returns array of deploys', async () => {
    const result = await getDeploys()
    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBe(20)
    expect(result[0]).toHaveProperty('num')
    expect(result[0]).toHaveProperty('env')
    expect(result[0]).toHaveProperty('branch')
    expect(result[0]).toHaveProperty('status')
    expect(result[0]).toHaveProperty('deployer')
  })

  it('getDeploys with "all" filter returns all deploys', async () => {
    const result = await getDeploys('all')
    expect(result.length).toBe(20)
  })

  it('getDeploys filters by environment', async () => {
    const result = await getDeploys('prod')
    expect(result.length).toBeGreaterThan(0)
    expect(result.every(d => d.env === 'prod')).toBe(true)
  })

  it('getDeployById returns a specific deploy', async () => {
    const all = await getDeploys()
    const deploy = await getDeployById(all[0].num)
    expect(deploy).toBeDefined()
    expect(deploy?.num).toBe(all[0].num)
  })

  it('getDeployById returns undefined for non-existent num', async () => {
    const deploy = await getDeployById(-999)
    expect(deploy).toBeUndefined()
  })

  it('cancelDeploy changes status to fail', async () => {
    const all = await getDeploys()
    const target = all[0]
    const cancelled = await cancelDeploy(target.num)
    expect(cancelled).toBeDefined()
    expect(cancelled?.status).toBe('fail')
    expect(cancelled?.duration).toBe('Cancelado')
  })

  it('cancelDeploy returns undefined for non-existent deploy', async () => {
    const result = await cancelDeploy(-999)
    expect(result).toBeUndefined()
  })

  it('rollbackDeploy returns the deploy', async () => {
    const all = await getDeploys()
    const result = await rollbackDeploy(all[1].num)
    expect(result).toBeDefined()
    expect(result?.num).toBe(all[1].num)
  })
})
