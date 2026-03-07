
export const NCat = {
    LINE: 'line',
    ANCHOR: 'anchor',
} as const

export type NCatName = keyof typeof NCat
export type NCatValue = typeof NCat[NCatName]