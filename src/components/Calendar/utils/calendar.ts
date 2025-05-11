/* eslint-disable @typescript-eslint/no-explicit-any */
import dayjs from "dayjs";

import { getDatesBetween } from "../utils/date";

import type { ScheduleInstance } from "../../../models/schedule";

/**
 * Get a shift by its ID
 */
export const getShiftById = (schedule: ScheduleInstance, id: string) => {
  return schedule?.shifts?.find((shift) => shift.id === id);
};

/**
 * Get an assignment by its ID
 */
export const getAssignmentById = (schedule: ScheduleInstance, id: string) => {
  return schedule?.assignments?.find((assign) => id === assign.id);
};

/**
 * Get a staff member by their ID
 */
export const getStaffById = (schedule: ScheduleInstance, id: string) => {
  return schedule?.staffs?.find((staff) => id === staff.id);
};

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
 * Get the date of the first event in the schedule
 */
export const getFirstEventDate = (
  schedule: ScheduleInstance,
  selectedStaffId: string | null
) => {
  if (!schedule?.assignments || schedule.assignments.length === 0) {
    return dayjs(schedule?.scheduleStartDate).toDate();
  }

  // Filter assignments for selected staff only
  const staffAssignments = schedule.assignments.filter(
    (assignment) => assignment.staffId === selectedStaffId
  );

  if (staffAssignments.length === 0) {
    return dayjs(schedule?.scheduleStartDate).toDate();
  }

  const earliestAssignment = staffAssignments.reduce((earliest, current) => {
    const currentDate = dayjs(current.shiftStart);
    const earliestDate = dayjs(earliest.shiftStart);
    return currentDate.isBefore(earliestDate) ? current : earliest;
  });

  return dayjs(earliestAssignment.shiftStart).toDate();
};

/**
 * Get pair dates for a specific staff member
 * Returns a map of date -> partnered staff ID
 */
export const getPairDatesForStaff = (
  schedule: ScheduleInstance,
  staffId: string
) => {
  const staff = getStaffById(schedule, staffId);
  if (!staff?.pairList || staff.pairList.length === 0) {
    return {};
  }

  const pairDatesMap: { [key: string]: string } = {};

  staff.pairList.forEach((pair: any) => {
    const pairDatesInRange = getDatesBetween(pair.startDate, pair.endDate);
    pairDatesInRange.forEach((date) => {
      pairDatesMap[date] = pair.staffId;
    });
  });

  return pairDatesMap;
};
