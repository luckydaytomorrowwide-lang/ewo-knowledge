import type { EwoCloudEvent } from './cloudEvent'
import { createCloudEvent } from './cloudEvent'
import type { AnswerBus } from './eventBus'
import type { PayloadStore } from './payloadStore'

import { DemoAC1_ComputeSquareAC } from '~/workflowDefs/demo/activities/DemoAC1_ComputeSquareAC'
import { DemoAC2_GenerateRangeAC } from '~/workflowDefs/demo/activities/DemoAC2_GenerateRangeAC'
import { DemoAC3_SumArrayAC } from '~/workflowDefs/demo/activities/DemoAC3_SumArrayAC'
import { DemoAC4_CombineResultsAC } from '~/workflowDefs/demo/activities/DemoAC4_CombineResultsAC'
import { DemoAC5_FinalCalcAC } from '~/workflowDefs/demo/activities/DemoAC5_FinalCalcAC'
import { DemoFetchMetaAC } from '~/workflowDefs/demo/activities/DemoFetchMetaAC'
import { DemoGenThumbAC } from '~/workflowDefs/demo/activities/DemoGenThumbAC'
import { DemoLoadProfileAC } from '~/workflowDefs/demo/activities/DemoLoadProfileAC'
import { DemoLoadBillingAC } from '~/workflowDefs/demo/activities/DemoLoadBillingAC'
import { DemoMakeReportAC } from '~/workflowDefs/demo/activities/DemoMakeReportAC'
import { DemoCheckTicketAC } from '~/workflowDefs/demo/activities/DemoCheckTicketAC'
import { DemoPurchaseTicketAC } from '~/workflowDefs/demo/activities/DemoPurchaseTicketAC'
import { DemoViewImageAC } from '~/workflowDefs/demo/activities/DemoViewImageAC'
import { DemoSearchAC } from '~/workflowDefs/demo/activities/DemoSearchAC'
import { DemoFetchDetailAC } from '~/workflowDefs/demo/activities/DemoFetchDetailAC'
import { DemoAssembleAC } from '~/workflowDefs/demo/activities/DemoAssembleAC'
import { DemoEnrichItemAC } from '~/workflowDefs/demo/activities/DemoEnrichItemAC'
import { DemoCalcTaxAC } from '~/workflowDefs/demo/activities/DemoCalcTaxAC'
import { DemoFormatReceiptAC } from '~/workflowDefs/demo/activities/DemoFormatReceiptAC'
import { DemoClassifyOrderAC } from '~/workflowDefs/demo/activities/DemoClassifyOrderAC'
import { DemoProcessStandardAC } from '~/workflowDefs/demo/activities/DemoProcessStandardAC'
import { DemoValidateExpressAC } from '~/workflowDefs/demo/activities/DemoValidateExpressAC'
import { DemoShipExpressAC } from '~/workflowDefs/demo/activities/DemoShipExpressAC'
import { DemoFinalizeOrderAC } from '~/workflowDefs/demo/activities/DemoFinalizeOrderAC'
import { DemoValidateUserAC } from '~/workflowDefs/demo/activities/DemoValidateUserAC'
import { DemoProcessPaymentAC } from '~/workflowDefs/demo/activities/DemoProcessPaymentAC'
import { DemoIssueTicketAC } from '~/workflowDefs/demo/activities/DemoIssueTicketAC'
import { DemoFetchStudentsAC } from '~/workflowDefs/demo/activities/DemoFetchStudentsAC'
import { DemoFetchGradesAC } from '~/workflowDefs/demo/activities/DemoFetchGradesAC'
import { DemoNormalizeGradeAC } from '~/workflowDefs/demo/activities/DemoNormalizeGradeAC'
import { DemoSummarizeStudentAC } from '~/workflowDefs/demo/activities/DemoSummarizeStudentAC'
import { DemoBuildClassReportAC } from '~/workflowDefs/demo/activities/DemoBuildClassReportAC'
import { DemoGetChildrenAC } from '~/workflowDefs/demo/activities/DemoGetChildrenAC'
import { DemoAssembleTreeAC } from '~/workflowDefs/demo/activities/DemoAssembleTreeAC'
import { getCommonActivities } from '~/workflowDefs/common/activities'

type AcFunction = (payload: any) => Promise<any>

const acRegistry: Record<string, AcFunction> = {
  DemoAC1_ComputeSquareAC,
  DemoAC2_GenerateRangeAC,
  DemoAC3_SumArrayAC,
  DemoAC4_CombineResultsAC,
  DemoAC5_FinalCalcAC,
  DemoFetchMetaAC,
  DemoGenThumbAC,
  DemoLoadProfileAC,
  DemoLoadBillingAC,
  DemoMakeReportAC,
  DemoCheckTicketAC,
  DemoPurchaseTicketAC,
  DemoViewImageAC,
  DemoSearchAC,
  DemoFetchDetailAC,
  DemoAssembleAC,
  DemoEnrichItemAC,
  DemoCalcTaxAC,
  DemoFormatReceiptAC,
  DemoClassifyOrderAC,
  DemoProcessStandardAC,
  DemoValidateExpressAC,
  DemoShipExpressAC,
  DemoFinalizeOrderAC,
  DemoValidateUserAC,
  DemoProcessPaymentAC,
  DemoIssueTicketAC,
  DemoFetchStudentsAC,
  DemoFetchGradesAC,
  DemoNormalizeGradeAC,
  DemoSummarizeStudentAC,
  DemoBuildClassReportAC,
  DemoGetChildrenAC,
  DemoAssembleTreeAC,
}

let _commonLoaded = false
function ensureCommonActivities(): void {
  if (_commonLoaded) return
  _commonLoaded = true
  const common = getCommonActivities()
  for (const [name, fn] of Object.entries(common)) {
    if (!(name in acRegistry)) {
      acRegistry[name] = fn as AcFunction
    }
  }
}

export function resolveAc(operation: string): AcFunction | undefined {
  ensureCommonActivities()
  return acRegistry[operation]
}

export async function executeAc(
  cmdEvent: EwoCloudEvent,
  payloadStore: PayloadStore,
  answerBus: AnswerBus,
): Promise<void> {
  const acId = cmdEvent.acid || cmdEvent.type.replace('.cmd', '')
  const operation = cmdEvent.data?.operation as string | undefined
  const acFn = resolveAc(operation || acId)

  if (!acFn) {
    console.error(`[AC Worker] Unknown operation: ${operation || acId}`)
    answerBus.publish(createCloudEvent({
      type: `${acId}.error`,
      source: `urn:ac:${acId}`,
      correlationid: cmdEvent.correlationid,
      acid: acId,
      data: { error: `Unknown operation: ${operation || acId}` },
    }))
    return
  }

  try {
    const payload = cmdEvent.data?.payload ?? cmdEvent.data ?? {}
    const isIteration = cmdEvent.iterationid != null
    const iterLabel = isIteration ? ` [iter ${cmdEvent.iterationid}]` : ''
    console.log(`[AC Worker] Executing ${acId}${iterLabel} (${operation || acId})`)

    const result = await acFn(payload)

    let ref = payloadStore.makeRef(cmdEvent.correlationid, acId)
    const zoneId = cmdEvent.data?.zoneId
    if (zoneId != null && cmdEvent.iterationid != null) {
      ref = `${ref}:${zoneId}:${cmdEvent.iterationid}`
    } else if (isIteration) {
      ref = `${ref}:${cmdEvent.iterationid}`
    }
    payloadStore.set(ref, result)

    console.log(`[AC Worker] ${acId}${iterLabel} done → payloadStore[${ref}]`)

    const doneData: Record<string, any> = { outputRef: ref }
    if (zoneId != null) {
      doneData.zoneId = zoneId
    }

    answerBus.publish(createCloudEvent({
      type: `${acId}.done`,
      source: `urn:ac:${operation || acId}`,
      correlationid: cmdEvent.correlationid,
      acid: acId,
      iterationid: cmdEvent.iterationid,
      data: doneData,
    }))
  } catch (err: any) {
    console.error(`[AC Worker] ${acId} error:`, err.message)
    answerBus.publish(createCloudEvent({
      type: `${acId}.error`,
      source: `urn:ac:${operation || acId}`,
      correlationid: cmdEvent.correlationid,
      acid: acId,
      data: { error: err.message, stack: err.stack },
    }))
  }
}
