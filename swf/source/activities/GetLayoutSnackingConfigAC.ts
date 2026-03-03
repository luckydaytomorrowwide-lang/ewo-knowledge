/**
 * GetLayoutSnackingConfigAC
 */

import type { ActivityFunction } from '~/types/activity'
import {Label} from "~/constants/Label";
import {Column} from "~/constants/Column";
import {Key} from "~/constants/Key";
import {Edge} from "~/constants/Edge";

export type GetLayoutSnackingConfigACPayload = {
  configId: string
}

export type GetLayoutSnackingConfigACResult = {
  configs: [{
    no: string
    nodeLabel: string | null
    searchType: number
    edgeType: string | null
    anchorKey: string
    lineKey: string
    column: string
  }]
}

export const GetLayoutSnackingConfigAC: ActivityFunction = async (
  payload: GetLayoutSnackingConfigACPayload
): Promise<GetLayoutSnackingConfigACResult> => {
  const startTime = performance.now()
  console.log('[GetLayoutSnackingConfigAC] 実行開始:', payload)

  const output: GetLayoutSnackingConfigACResult = {configs: [] as any}

  switch (payload.configId) {
    case 'jobseeker':
      output['configs'].push(...[
        {no:"N001", nodeLabel: null,          searchType: 1, edgeType: null, anchorKey: "fieldDisplayName",      lineKey: Key.VALUE, column: Column.VALUE},
        {no:"N002", nodeLabel: null,          searchType: 1, edgeType: null, anchorKey: "fieldConnectPid",       lineKey: Key.LABEL, column: Column.VALUE},
        {no:"N003", nodeLabel: null,          searchType: 1, edgeType: null, anchorKey: "fieldConnectPid",       lineKey: Key.VALUE, column: Column.VALUE},
      ])
      break
    case 'message':
      output['configs'].push(...[
        {no:"N001", nodeLabel: Label.PID,     searchType: 2, edgeType: Edge.SENT_BY, anchorKey: "fieldAvatar",           lineKey: Key.VALUE, column: Column.VALUE},
        {no:"N002", nodeLabel: null,          searchType: 1, edgeType: null,         anchorKey: "sectionBody",           lineKey: Key.LABEL, column: Column.VALUE},
        {no:"N003", nodeLabel: null,          searchType: 1, edgeType: null,         anchorKey: "fieldBody",             lineKey: Key.VALUE, column: Column.VALUE},
        {no:"N004", nodeLabel: null,          searchType: 1, edgeType: null,         anchorKey: "sectionAttachmentFile", lineKey: Key.LABEL, column: Column.VALUE},
        {no:"N005", nodeLabel: null,          searchType: 1, edgeType: null,         anchorKey: "fieldAttachmentFile",   lineKey: Key.VALUE, column: Column.VALUE},
      ])
      break
    case 'topic':
      output['configs'].push(...[
        {no:"N001", nodeLabel: Label.SCHEDULE, searchType: 2, edgeType: Edge.CANDIDATE, anchorKey: "fieldKind",      lineKey: Key.VALUE, column: Column.VALUE},
        {no:"N002", nodeLabel: Label.SCHEDULE, searchType: 2, edgeType: Edge.CANDIDATE, anchorKey: "fieldTimeRange", lineKey: Key.VALUE, column: Column.VALUE},
      ])
      // output['configs'].push(...[
      //   {no:"N001", nodeLabel: Label.TOPIC, searchType: 1, edgeType: null, anchorKey: "fieldTitle",  lineKey: Key.VALUE, column: Column.VALUE},
      //   {no:"N002", nodeLabel: Label.TOPIC, searchType: 1, edgeType: null, anchorKey: "fieldStatus", lineKey: Key.LABEL, column: Column.VALUE},
      //   {no:"N003", nodeLabel: Label.TOPIC, searchType: 1, edgeType: null, anchorKey: "fieldStatus", lineKey: Key.VALUE, column: Column.VALUE},
      //   {no:"N004", nodeLabel: Label.TOPIC, searchType: 1, edgeType: null, anchorKey: "fieldTime",   lineKey: Key.LABEL, column: Column.VALUE},
      //   {no:"N005", nodeLabel: Label.TOPIC, searchType: 1, edgeType: null, anchorKey: "fieldTime",   lineKey: Key.VALUE, column: Column.VALUE}
      // ])
      break
    case 'schedule':
      output['configs'].push(...[
        {no:"N001", nodeLabel: Label.SCHEDULE, searchType: 1, edgeType: null,         anchorKey: "fieldKind",      lineKey: Key.VALUE, column: Column.VALUE},
        {no:"N002", nodeLabel: Label.SCHEDULE, searchType: 1, edgeType: null,         anchorKey: "fieldTimeRange", lineKey: Key.VALUE, column: Column.VALUE},
        {no:"N003", nodeLabel: Label.PID,      searchType: 2, edgeType: Edge.SENT_BY, anchorKey: "fieldAvatar",    lineKey: Key.VALUE, column: Column.VALUE}
      ])
      break
    default:
      output['configs'].push(...[
        // {no:"N001", nodeLabel: ["宛先PID", "Instance"], anchorKey: "fieldAvatar", lineKey: Key.VALUE, column: Column.VALUE},
        {no:"N002", nodeLabel: Label.BASEINFO, searchType: 1, edgeType: null, anchorKey: "fieldName",   lineKey: Key.LABEL, column: Column.VALUE},
        {no:"N003", nodeLabel: Label.BASEINFO, searchType: 1, edgeType: null, anchorKey: "fieldName",   lineKey: Key.VALUE, column: Column.VALUE},
        {no:"N004", nodeLabel: Label.BASEINFO, searchType: 1, edgeType: null, anchorKey: "fieldGender", lineKey: Key.LABEL, column: Column.VALUE},
        {no:"N005", nodeLabel: Label.BASEINFO, searchType: 1, edgeType: null, anchorKey: "fieldGender", lineKey: Key.VALUE, column: Column.VALUE},
        {no:"N006", nodeLabel: Label.BASEINFO, searchType: 1, edgeType: null, anchorKey: "fieldFee",    lineKey: Key.LABEL, column: Column.VALUE},
        {no:"N007", nodeLabel: Label.BASEINFO, searchType: 1, edgeType: null, anchorKey: "fieldFee",    lineKey: Key.VALUE, column: Column.VALUE},
        {no:"N008", nodeLabel: Label.CAREER, searchType: 1, edgeType: null, anchorKey: "sectionSkill", lineKey: Key.LABEL, column: Column.VALUE},
        {no:"N009", nodeLabel: Label.CAREER, searchType: 1, edgeType: null, anchorKey: "fieldDevlang", lineKey: Key.VALUE, column: Column.VALUE},
        {no:"N010", nodeLabel: Label.CAREER, searchType: 1, edgeType: null, anchorKey: "fieldDb", lineKey: Key.VALUE, column: Column.VALUE},
        // {no:"N011", nodeLabel: Label.CAREER, anchorKey: "fieldOs", lineKey: Key.VALUE, column: Column.VALUE}
      ])
      const msg = '[GetLayoutSnackingConfigAC] Invalid lineKey provided:'
      // alert(msg)
      console.log(msg, output)
      break
  }



  const endTime = performance.now()
  console.log(`[GetLayoutSnackingConfigAC] 完了 (${(endTime - startTime).toFixed(3)}ms):`, output)
  return output
}

export const GetLayoutSnackingConfigACDef = {
  name: 'GetLayoutSnackingConfigAC',
  scope: 'common',
  description: 'lineKeyに基づいてテンプレートタイプを検索する'
}
