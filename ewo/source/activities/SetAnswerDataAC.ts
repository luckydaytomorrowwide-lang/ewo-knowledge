import type { ActivityFunction } from '~/types/activity'
import { useAnswerDataStore } from '~/stores/answerDataStore'

export const SetAnswerDataAC: ActivityFunction = async (input: any): Promise<any> => {
    console.log('[SetAnswerDataAC] Input:', input)
    const { key, data, options } = input

    if (!key || !data) {
        throw new Error('[SetAnswerDataAC] Missing required input: key or data')
    }

    const answerDataStore = useAnswerDataStore()

    const dataId = answerDataStore.addAnswerData(key, data, options)

    console.log('[SetAnswerDataAC] Saved to AnswerStore:', { key, dataId })

    return {
        dataId,
        status: 'saved'
    }
}
