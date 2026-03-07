// ~/constants/UCat.ts
// Generated from laravel/app/Enums/UCat.php (App\Enums\UCat)
// Keep this list in sync with backend to avoid mismatches.

// value-side (same as PHP enum values)
export const UCat = {
  NODE: 'node',
  ROOT: 'root',
  SECTION: 'section',
  FIELD: 'field',
  CONFIG: 'config',
  DISPLAY: 'display',
  FEED: 'feed',
  NODE_DATA: 'nodeData',
  EDGE: 'edge',
  OUT_EDGE: 'outEdge',
  IN_EDGE: 'inEdge',
  INSTANCE_LIST: 'instanceList',
  INSTANCE_DETAIL_VIEW: 'instanceDetailView',
  INSTANCE_DETAIL_EDIT: 'instanceDetailEdit',
  TEMPLATE_DETAIL_VIEW: 'templateDetailView',
  TEMPLATE_DETAIL_EDIT: 'templateDetailEdit',
  TAB: 'tab',
  BUTTON: 'button',
  AUTO: 'auto',
  JOINT: 'joint',
  OPTION: 'option',
} as const

export type UCatName = keyof typeof UCat
export type UCatValue = typeof UCat[UCatName]