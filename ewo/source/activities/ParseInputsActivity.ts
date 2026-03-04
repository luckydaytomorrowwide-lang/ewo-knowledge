import type { ActivityFunction } from '~/types/activity'

export const ParseInputsActivity: ActivityFunction = async (input: any): Promise<any> => {
    console.log('[ParseInputsActivity] Input:', input)

    // Flatten inputs: In a real scenario, this would parse and flatten complex structures.
    // For the mock, we just return the input as is, or slightly flattened if needed.
    // The image says "All properties are parsed and output flatly".

    let flattened = { ...input }

    // If input is wrapped in an 'input' property (common pattern in our workflow engine), flatten it
    if (input.input && typeof input.input === 'object') {
        flattened = { ...flattened, ...input.input }
    }

    console.log('[ParseInputsActivity] Output:', flattened)
    return flattened
}
