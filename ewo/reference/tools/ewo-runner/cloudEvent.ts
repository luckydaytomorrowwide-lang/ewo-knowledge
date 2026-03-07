export interface EwoCloudEvent<T = any> {
  specversion: '1.0'
  type: string
  source: string
  id: string
  time: string
  correlationid: string
  wfid?: string
  acid?: string
  port?: string
  iterationid?: number
  data?: T
}

let _counter = 0

function generateId(): string {
  const ts = Date.now().toString(36)
  const rnd = Math.random().toString(36).slice(2, 6)
  return `${ts}-${rnd}-${++_counter}`
}

export function createCloudEvent<T = any>(
  overrides: Partial<EwoCloudEvent<T>> & Pick<EwoCloudEvent<T>, 'type' | 'source' | 'correlationid'>,
): EwoCloudEvent<T> {
  return {
    specversion: '1.0',
    id: generateId(),
    time: new Date().toISOString(),
    ...overrides,
  } as EwoCloudEvent<T>
}
