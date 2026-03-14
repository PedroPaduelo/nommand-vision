import { delay } from '../api'

describe('api', () => {
  it('delay resolves after specified time', async () => {
    const start = Date.now()
    await delay(50)
    expect(Date.now() - start).toBeGreaterThanOrEqual(40)
  })

  it('delay uses default parameter when no argument given', async () => {
    const start = Date.now()
    await delay()
    const elapsed = Date.now() - start
    expect(elapsed).toBeGreaterThanOrEqual(200)
  })

  it('delay returns a promise that resolves to void', async () => {
    const result = await delay(10)
    expect(result).toBeUndefined()
  })
})
