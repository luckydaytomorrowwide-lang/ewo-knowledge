import type { ActivityFunction } from '~/types/activity'

export const GenerateRequestActivity: ActivityFunction = async (input: any): Promise<any> => {
    console.log('[GenerateRequestActivity] Input:', input)
    const { flowId, containerId, matchId, inputParams } = input

    // Mock logic to generate RequestCards
    // The image shows an array of RequestCards being generated.

    const requestCards = [
        {
            id: 'req-' + Date.now() + '-1',
            flowId,
            containerId,
            param: inputParams?.[0], // 'nodeId'
            status: 'pending'
        },
        {
            id: 'req-' + Date.now() + '-2',
            flowId,
            containerId,
            param: inputParams?.[0],
            status: 'pending'
        }
    ]

    console.log('[GenerateRequestActivity] Output:', requestCards)
    return requestCards
}
