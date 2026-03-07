import type { ActivityFunction } from '~/types/activity'

export const ProcessJointInputActivity: ActivityFunction = async (input: any): Promise<any> => {
    console.log('[ProcessJointInputActivity] Input:', input)

    // Payload comes as { input: ... } from the workflow definition
    const data = input.input || input;

    let targetNode: any = null;

    // Check if data itself has the structure (unlikely based on example key)
    if (data?.jointIds) {
        targetNode = data
    } else {
        // Iterate over keys in the data object
        for (const key in data) {
            if (data[key]?.jointIds) {
                targetNode = data[key];
                console.log('[ProcessJointInputActivity] Found target node at key:', key)
                break;
            }
        }
    }

    if (!targetNode) {
        console.warn('[ProcessJointInputActivity] No node with jointIds found.')
        return {
            common: {},
            joints: []
        }
    }

    // New structure: common is replaced by property, jointIds is sibling
    const property = targetNode.property || {};
    const joints = targetNode.jointIds || [];

    console.log('[ProcessJointInputActivity] Found:', { property, joints })

    return {
        property,
        joints
    }
}
