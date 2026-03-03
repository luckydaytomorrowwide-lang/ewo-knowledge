import type { ActivityFunction } from '~/types/activity'

export const MergeInputActivity: ActivityFunction = async (input: any): Promise<any> => {
    console.log('[MergeInputActivity] Input:', input)
    const { property, joint, cncf } = input

    // Merge Property and Joint Options into Input
    const mergedInput = {
        ...property,
        ...joint.options,
        jointId: joint.jointId, // Include identification
        _timestamp: Date.now()
    }

    console.log('[MergeInputActivity] Merged Input:', mergedInput)

    // Return the structure expected by SaveToAnswerStore
    // We pass through cncf so the next step has everything
    return {
        cncf: cncf,
        input: mergedInput
    }
}
