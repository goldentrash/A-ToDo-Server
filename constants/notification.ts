import { type RecurrenceSpecObjLit } from "node-schedule";

export const PUSH_CHANNEL_ID = "push";

// GMT 0
export const SCHEDULE_PUSH_WATING_ALARM: RecurrenceSpecObjLit = {
  hour: 23,
  minute: 0,
};
export const SCHEDULE_PUSH_OLD_WORKING_HINT: RecurrenceSpecObjLit = {
  hour: 11,
  minute: 0,
};

export const OLD_WORKING_BASE_TIME = 8;
