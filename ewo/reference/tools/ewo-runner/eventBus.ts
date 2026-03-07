import type { EwoCloudEvent } from './cloudEvent'

type EventHandler = (event: EwoCloudEvent) => void

export class EventBus {
  private handlers: EventHandler[] = []
  private history: EwoCloudEvent[] = []
  readonly name: string

  constructor(name: string) {
    this.name = name
  }

  publish(event: EwoCloudEvent): void {
    this.history.push(event)

    const extra = [
      event.acid ? `acid=${event.acid}` : '',
      event.port ? `port=${event.port}` : '',
      event.iterationid != null ? `iter=${event.iterationid}` : '',
    ].filter(Boolean).join(' ')
    const dataPreview = event.data
      ? JSON.stringify(event.data).slice(0, 120)
      : ''
    console.log(
      `[${this.name}] ${event.type}  corr=${event.correlationid}${extra ? ' ' + extra : ''}${dataPreview ? '  data=' + dataPreview : ''}`,
    )

    for (const handler of this.handlers) {
      try {
        handler(event)
      } catch (err) {
        console.error(`[${this.name}] Handler error for ${event.type}:`, err)
      }
    }
  }

  subscribe(handler: EventHandler): () => void {
    this.handlers.push(handler)
    return () => {
      const idx = this.handlers.indexOf(handler)
      if (idx >= 0) this.handlers.splice(idx, 1)
    }
  }

  waitFor(
    filter: (event: EwoCloudEvent) => boolean,
    timeoutMs = 30000,
  ): Promise<EwoCloudEvent> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        unsub()
        reject(new Error(`[${this.name}] waitFor timed out after ${timeoutMs}ms`))
      }, timeoutMs)

      const unsub = this.subscribe((event) => {
        if (filter(event)) {
          clearTimeout(timer)
          unsub()
          resolve(event)
        }
      })
    })
  }

  getHistory(): ReadonlyArray<EwoCloudEvent> {
    return this.history
  }

  clear(): void {
    this.handlers = []
    this.history = []
  }
}

export class AnswerBus extends EventBus {
  constructor() {
    super('AnswerBus')
  }
}

export class RequestBus extends EventBus {
  constructor(wfId: string) {
    super(`RequestBus:${wfId}`)
  }
}

export class RequestBusRegistry {
  private buses = new Map<string, RequestBus>()

  getOrCreate(wfId: string): RequestBus {
    let bus = this.buses.get(wfId)
    if (!bus) {
      bus = new RequestBus(wfId)
      this.buses.set(wfId, bus)
    }
    return bus
  }

  get(wfId: string): RequestBus | undefined {
    return this.buses.get(wfId)
  }

  clear(): void {
    for (const bus of this.buses.values()) bus.clear()
    this.buses.clear()
  }
}
