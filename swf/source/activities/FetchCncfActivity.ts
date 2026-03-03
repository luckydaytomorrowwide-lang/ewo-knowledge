import type { ActivityFunction } from '~/types/activity'

export const FetchCncfActivity: ActivityFunction = async (input: any): Promise<any> => {
    console.log('[FetchCncfActivity] Input:', input)
    const { jointId } = input

    // Mock Fetch CNCF Workflow Definition
    // In a real scenario, this would be fetched based on jointId
    const cncfDefinition = {
        id: `wf-cncf-${Date.now()}`,
        version: '1.0.0',
        specVersion: '0.8',
        name: 'Mocked CNCF Workflow',
        start: 'ParseInputs',
        states: [
            {
                name: 'ParseInputs',
                type: 'operation',
                actions: [
                    {
                        name: 'parseInputsAction',
                        functionRef: {
                            refName: 'parseInputs',
                            arguments: {
                                input: '${ . }'
                            }
                        },
                        actionDataFilter: {
                            toStateData: '${ .parsed }'
                        }
                    }
                ],
                transition: 'GenerateRequest'
            },
            {
                name: 'GenerateRequest',
                type: 'operation',
                actions: [
                    {
                        name: 'generateRequestAction',
                        functionRef: {
                            refName: 'generateRequest',
                            arguments: {
                                flowId: '${ .parsed.flowId }', // Assuming these exist in input
                                containerId: '${ .parsed.containerId }',
                                matchId: 1,
                                inputParams: ['nodeId']
                            }
                        },
                        actionDataFilter: {
                            toStateData: '${ .requests }'
                        }
                    }
                ],
                transition: 'ProcessRequests'
            },
            {
                name: 'ProcessRequests',
                type: 'operation',
                actions: [
                    {
                        name: 'requestEventAction',
                        functionRef: {
                            refName: 'requestEvent',
                            arguments: {
                                // Pass the generated requests (array) or a specific one depending on requirement.
                                // Based on user feedback "RequestEvent is once", we pass the output of GenerateRequest.
                                requests: '${ .requests }'
                            }
                        },
                        actionDataFilter: {
                            toStateData: '${ .result }'
                        }
                    }
                ],
                end: true
            }
        ],
        functions: [
            {
                name: 'parseInputs',
                type: 'custom',
                operation: 'custom:ParseInputsActivity'
            },
            {
                name: 'generateRequest',
                type: 'custom',
                operation: 'custom:GenerateRequestActivity'
            },
            {
                name: 'requestEvent',
                type: 'custom',
                operation: 'custom:RequestEventActivity'
            }
        ]
    }

    console.log('[FetchCncfActivity] Fetched:', cncfDefinition.id)

    return {
        cncf: cncfDefinition
    }
}
