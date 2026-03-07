export interface WfDep {
  sourceAcId: string
  sourcePort: string
}

export interface WfDepLiteral {
  literal: any
}

export interface WfDepOneOf {
  oneOf: WfDep[]
}

export type WfDepType = WfDep | WfDepLiteral | WfDepOneOf

export interface WfNode {
  id: string
  operation: string
  deps: Record<string, WfDepType>
  outputs: Record<string, Record<string, never>>
  guard?: string
  wfCall?: {
    callee: string
    calleeVersion?: string
    boundary: boolean
    recursive?: boolean
    policy?: {
      timeoutSec?: number
      maxRecursionDepth?: number
      retry?: { max: number; backoffSec: number }
    }
  }
}

export interface ForEachZone {
  id: string
  collectionSource: {
    sourceAcId: string
    sourcePort: string
  }
  iterationParam: string
  nodes: string[]
  childZones?: ForEachZone[]
  outputNodeId: string
  outputPort: string
  outputCollection: string
  mode?: 'sequential' | 'parallel'
}

export interface WfDef {
  nodes: WfNode[]
  forEachZones?: ForEachZone[]
  inputs: Record<string, { schema: string }>
  outputs: Record<string, string>
}

export interface WiringEmit {
  type: string
  wfid: string
  map: string
}

export interface WiringRoute {
  id: string
  when: { type: string }
  correlate: { by: string[] }
  emit: WiringEmit[]
}

export interface Wiring {
  version: number
  routes: WiringRoute[]
}

export interface EwoLayoutNode {
  id: string
  type: string
  position: { x: number; y: number }
  style?: Record<string, string>
  parentNode?: string
  extent?: 'parent'
  data?: Record<string, any>
}

export interface EwoLayoutEdge {
  id: string
  source: string
  target: string
  sourceHandle?: string
  targetHandle?: string
}

export interface EwoLayout {
  viewport: { x: number; y: number; zoom: number }
  nodes: EwoLayoutNode[]
  edges: EwoLayoutEdge[]
}

export interface EwoJson {
  id: string
  version: string
  name: string
  description?: string
  inputs: Record<string, { schema: string }>
  wfDef: {
    nodes: WfNode[]
    forEachZones?: ForEachZone[]
    outputs: Record<string, string>
  }
  wiring: Wiring
  layout: EwoLayout
}

export function isWfDep(dep: WfDepType): dep is WfDep {
  return 'sourceAcId' in dep
}

export function isWfDepLiteral(dep: WfDepType): dep is WfDepLiteral {
  return 'literal' in dep
}

export function isWfDepOneOf(dep: WfDepType): dep is WfDepOneOf {
  return 'oneOf' in dep
}

export function isZoneDep(dep: WfDepType): boolean {
  return isWfDep(dep) && dep.sourceAcId.startsWith('$zone:')
}

export function isZoneInputDep(dep: WfDepType): boolean {
  return isWfDep(dep) && dep.sourceAcId === '$zoneInput'
}
