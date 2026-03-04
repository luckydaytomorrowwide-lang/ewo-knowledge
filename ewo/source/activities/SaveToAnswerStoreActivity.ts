import type { ActivityFunction } from '~/types/activity'
import { useAnswerDataStore } from '~/stores/answerDataStore'

export const SaveToAnswerStoreActivity: ActivityFunction = async (input: any): Promise<any> => {
    console.log('[SaveToAnswerStoreActivity] Input:', input)
    const { cncf, input: inputData } = input

    const answerDataStore = useAnswerDataStore()

    // We save the pair { cncf, inputs }
    // The key 'wf-trigger-queue' is what the daemon will listen to.
    const key = 'wf-trigger-queue'

    // Add metadata if needed
    const dataId = answerDataStore.addAnswerData(key, {
        workflowDef: cncf,
        input: inputData
    }, {
        type: 'workflow-trigger',
        timestamp: Date.now()
    })

    console.log('[SaveToAnswerStoreActivity] Saved to AnswerStore:', dataId)

    return {
        dataId,
        status: 'queued'
    }
}
