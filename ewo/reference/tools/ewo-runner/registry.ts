import type { EwoJson } from '../types'

export interface WfRegistryEntry {
  wfId: string
  version: string
  publicPorts: {
    in: Array<{ name: string; schema?: string }>
    out: Array<{ name: string; schema?: string }>
  }
  ewoJson: EwoJson
}

export interface WfRegistry {
  register(ewoJson: EwoJson): void
  lookup(wfId: string, version?: string): WfRegistryEntry | undefined
  listAll(): WfRegistryEntry[]
}

export class InMemoryWfRegistry implements WfRegistry {
  private entries = new Map<string, WfRegistryEntry>()

  register(ewoJson: EwoJson): void {
    const entry: WfRegistryEntry = {
      wfId: ewoJson.id,
      version: ewoJson.version ?? '1.0.0',
      publicPorts: {
        in: Object.keys(ewoJson.inputs ?? {}).map(name => ({ name })),
        out: Object.keys(ewoJson.wfDef.outputs ?? {}).map(name => ({ name })),
      },
      ewoJson,
    }
    this.entries.set(ewoJson.id, entry)
  }

  lookup(wfId: string, _version?: string): WfRegistryEntry | undefined {
    return this.entries.get(wfId)
  }

  listAll(): WfRegistryEntry[] {
    return [...this.entries.values()]
  }
}
