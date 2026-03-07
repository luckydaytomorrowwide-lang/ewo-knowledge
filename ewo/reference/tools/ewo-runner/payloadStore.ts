export class PayloadStore {
  private store = new Map<string, any>()

  set(ref: string, data: any): void {
    this.store.set(ref, data)
  }

  get(ref: string): any {
    return this.store.get(ref)
  }

  has(ref: string): boolean {
    return this.store.has(ref)
  }

  makeRef(correlationId: string, acId: string): string {
    return `wf:${correlationId}:${acId}`
  }

  clear(): void {
    this.store.clear()
  }
}
