import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import customParseFormat from "dayjs/plugin/customParseFormat";
import type { ScheduleInstance } from "../../../models/schedule";

// Extend dayjs with plugins
dayjs.extend(utc);
dayjs.extend(isSameOrBefore);
dayjs.extend(customParseFormat); // requered for different date formats

/**
 * Get all valid dates within the schedule period
 */
export const getCalendarValidDates = (schedule: ScheduleInstance) => {
  const dates = [];
  let currentDate = dayjs(schedule.scheduleStartDate);
  while (
    currentDate.isBefore(schedule.scheduleEndDate) ||
    currentDate.isSame(schedule.scheduleEndDate)
  ) {
    dates.push(currentDate.format("YYYY-MM-DD"));
    currentDate = currentDate.add(1, "day");
  }
  return dates;
};

/**
 * Get all dates between two dates (inclusive)
 */
export const getDatesBetween = (startDate: string, endDate: string) => {
  const dates = [];
  const start = dayjs(startDate, "DD.MM.YYYY");
  const end = dayjs(endDate, "DD.MM.YYYY");

  let current = start.clone();

  while (current.isSameOrBefore(end, "day")) {
    dates.push(current.format("DD-MM-YYYY"));
    current = current.add(1, "day");
  }

  return dates;
};
