/**
 * Lightweight jq-like expression evaluator for EWO guard conditions.
 * Supports: property access (.prop), ==, !=, >, <, >=, <=, and/or, not, null/true/false/number/string literals.
 */
export function evaluateGuard(expression: string, data: Record<string, any>): boolean {
  const expr = expression.trim()
  const result = evalExpr(expr, data)
  return Boolean(result)
}

function evalExpr(expr: string, data: any): any {
  const trimmed = expr.trim()

  if (trimmed.includes(' and ')) {
    const parts = splitTopLevel(trimmed, ' and ')
    return parts.every(p => evalExpr(p, data))
  }

  if (trimmed.includes(' or ')) {
    const parts = splitTopLevel(trimmed, ' or ')
    return parts.some(p => evalExpr(p, data))
  }

  if (trimmed.startsWith('not ') || trimmed.startsWith('not(')) {
    const inner = trimmed.startsWith('not(')
      ? trimmed.slice(4, -1)
      : trimmed.slice(4)
    return !evalExpr(inner, data)
  }

  for (const op of ['==', '!=', '>=', '<=', '>', '<'] as const) {
    const idx = trimmed.indexOf(` ${op} `)
    if (idx !== -1) {
      const left = evalExpr(trimmed.substring(0, idx), data)
      const right = evalExpr(trimmed.substring(idx + op.length + 2), data)
      switch (op) {
        case '==': return left === right
        case '!=': return left !== right
        case '>': return left > right
        case '<': return left < right
        case '>=': return left >= right
        case '<=': return left <= right
      }
    }
  }

  if (trimmed.startsWith('.')) {
    return getByPath(data, trimmed.substring(1))
  }

  if (trimmed === 'null') return null
  if (trimmed === 'true') return true
  if (trimmed === 'false') return false
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return trimmed.slice(1, -1)
  }
  if (!isNaN(Number(trimmed))) return Number(trimmed)

  if (trimmed.startsWith('(') && trimmed.endsWith(')')) {
    return evalExpr(trimmed.slice(1, -1), data)
  }

  return trimmed
}

function getByPath(data: any, path: string): any {
  if (!data || !path) return data
  const parts = path.split('.')
  let current = data
  for (const part of parts) {
    if (current == null) return undefined
    const bracketIdx = part.indexOf('[')
    if (bracketIdx !== -1) {
      const key = part.substring(0, bracketIdx)
      const idx = parseInt(part.substring(bracketIdx + 1, part.indexOf(']')))
      current = current[key]
      if (Array.isArray(current)) current = current[idx]
      else return undefined
    } else {
      current = current[part]
    }
  }
  return current
}

function splitTopLevel(expr: string, separator: string): string[] {
  const result: string[] = []
  let depth = 0
  let current = ''
  let i = 0
  while (i < expr.length) {
    if (expr[i] === '(') depth++
    else if (expr[i] === ')') depth--

    if (depth === 0 && expr.substring(i).startsWith(separator)) {
      result.push(current.trim())
      current = ''
      i += separator.length
      continue
    }
    current += expr[i]
    i++
  }
  if (current.trim()) result.push(current.trim())
  return result
}
