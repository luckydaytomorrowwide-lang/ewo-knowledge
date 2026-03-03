import type { ActivityFunction } from '~/types/activity'

export const RequestEventActivity: ActivityFunction = async (input: any): Promise<any> => {
    console.log('[RequestEventActivity] Input:', input)

    // Input is expected to be a single RequestCard (iteration happens in workflow)
    // or the whole array if not iterated.
    // The image flow suggests iteration or batch processing. 
    // "const nodeId = RequestEventAC({ RequestCard })" suggests single item processing.

    // We return a mock nodeId
    const nodeId = `node-${Math.random().toString(36).substring(7)}`

    console.log('[RequestEventActivity] Output:', { nodeId })
    return {
        nodeId
    }
}
