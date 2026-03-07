import type { EwoCloudEvent } from './cloudEvent'
import { createCloudEvent } from './cloudEvent'
import type { Wiring, WiringRoute } from '../types'
import type { AnswerBus, EventBus } from './eventBus'

export class Mediator {
  private wiring: Wiring
  private requestBus: EventBus
  private processedIds = new Set<string>()

  constructor(wiring: Wiring, requestBus: EventBus) {
    this.wiring = wiring
    this.requestBus = requestBus
  }

  attachToAnswerBus(answerBus: AnswerBus): () => void {
    return answerBus.subscribe((event) => {
      this.processAnswer(event)
    })
  }

  processAnswer(event: EwoCloudEvent): void {
    const dedupeKey = event.iterationid != null
      ? `${event.id}:iter${event.iterationid}`
      : event.id

    if (this.processedIds.has(dedupeKey)) {
      console.log(`[Mediator] Dedupe: already processed ${dedupeKey}`)
      return
    }
    this.processedIds.add(dedupeKey)

    const matchedRoutes = this.wiring.routes.filter(
      (route) => route.when.type === event.type,
    )

    if (matchedRoutes.length === 0) return

    for (const route of matchedRoutes) {
      console.log(`[Mediator] Route ${route.id}: ${event.type} → ${route.emit.length} emit(s)`)

      for (const emitSpec of route.emit) {
        const emitEvent = createCloudEvent({
          type: emitSpec.type,
          source: `urn:mediator:${route.id}`,
          correlationid: event.correlationid,
          wfid: emitSpec.wfid,
          iterationid: event.iterationid,
          data: emitSpec.map === 'outputRef->payloadRef'
            ? { payloadRef: event.data?.outputRef }
            : event.data,
        })

        if (event.data?.zoneId) {
          emitEvent.data = { ...emitEvent.data, zoneId: event.data.zoneId }
        }

        this.requestBus.publish(emitEvent)
      }
    }
  }

  clear(): void {
    this.processedIds.clear()
  }
}
