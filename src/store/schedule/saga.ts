/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import type { Action } from "redux-actions";
import { put, takeEvery } from "redux-saga/effects";
import types from "./types";
import Logger from "../../utils/logger";
import * as actions from "./actions";
import { updateProgress } from "../ui/actions";
import type { Callbacks } from "../../utils/types";
import { scheduleReponse } from "../../constants/api";

function* asyncFetchSchedule({
  payload: { onSuccess, onError } = {},
}: Action<Callbacks>) {
  yield put(updateProgress());
  try {
    const response = scheduleReponse;
    yield put(actions.fetchScheduleSuccess(response.data));
    onSuccess && onSuccess(response);
  } catch (err) {
    Logger.error(err);
    onError && onError(err);
    yield put(actions.fetchScheduleFailed());
  } finally {
    yield put(updateProgress(false));
  }
}

// Yeni saga - Assignment güncellemesi
interface UpdateAssignmentPayload {
  assignmentId: string;
  newShiftStart: string;
  newShiftEnd: string;
  onSuccess?: (response?: any) => void;
  onError?: (err: any) => void;
}

function* asyncUpdateAssignment({ payload }: Action<UpdateAssignmentPayload>) {
  yield put(updateProgress());
  try {
    yield put(
      actions.updateAssignmentSuccess({
        assignmentId: payload.assignmentId,
        newShiftStart: payload.newShiftStart,
        newShiftEnd: payload.newShiftEnd,
      })
    );

    payload.onSuccess && payload.onSuccess();
  } catch (err) {
    Logger.error(err);
    payload.onError && payload.onError(err);
    yield put(actions.updateAssignmentFailed(err));
  } finally {
    yield put(updateProgress(false));
  }
}

const scheduleSagas = [
  takeEvery(types.FETCH_SCHEDULE, asyncFetchSchedule),
  takeEvery(types.UPDATE_ASSIGNMENT, asyncUpdateAssignment),
];

export default scheduleSagas;
