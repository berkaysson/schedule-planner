/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */

import { useEffect, useState } from "react";
import dayjs from "dayjs";
import FullCalendar from "@fullcalendar/react";

import { updateAssignment } from "../../../store/schedule/actions";
import {
  getShiftById,
  getAssignmentById,
  getStaffById,
  getCalendarValidDates,
  getFirstEventDate,
  getPairDatesForStaff,
} from "../utils/calendar";
import { getDatesBetween } from "../utils/date";

import type { EventInput } from "@fullcalendar/core/index.js";
import type { ScheduleInstance } from "../../../models/schedule";


// Color classes for different shifts
const classes = [
  "bg-one",
  "bg-two",
  "bg-three",
  "bg-four",
  "bg-five",
  "bg-six",
  "bg-seven",
  "bg-eight",
  "bg-nine",
  "bg-ten",
  "bg-eleven",
  "bg-twelve",
  "bg-thirteen",
  "bg-fourteen",
  "bg-fifteen",
  "bg-sixteen",
  "bg-seventeen",
  "bg-eighteen",
  "bg-nineteen",
  "bg-twenty",
  "bg-twenty-one",
  "bg-twenty-two",
  "bg-twenty-three",
  "bg-twenty-four",
  "bg-twenty-five",
  "bg-twenty-six",
  "bg-twenty-seven",
  "bg-twenty-eight",
  "bg-twenty-nine",
  "bg-thirty",
  "bg-thirty-one",
  "bg-thirty-two",
  "bg-thirty-three",
  "bg-thirty-four",
  "bg-thirty-five",
  "bg-thirty-six",
  "bg-thirty-seven",
  "bg-thirty-eight",
  "bg-thirty-nine",
  "bg-forty",
];

type UseCalendarHooksProps = {
  schedule: ScheduleInstance;
  selectedStaffId: string | null;
  staffColorMap: { [key: string]: string };
  calendarRef: React.RefObject<FullCalendar | null>;
  dispatch: any;
  setModalOpen: (value: boolean) => void;
  setSelectedEventDetails: (details: any) => void;
};

export const useCalendar = ({
  schedule,
  selectedStaffId,
  staffColorMap,
  calendarRef,
  dispatch,
  setModalOpen,
  setSelectedEventDetails,
}: UseCalendarHooksProps) => {
  const [events, setEvents] = useState<EventInput[]>([]);
  const [highlightedDates, setHighlightedDates] = useState<string[]>([]);
  const [pairDates, setPairDates] = useState<{ [key: string]: string }>({});
  const [initialDate, setInitialDate] = useState<Date>(new Date());

  // Generate events for the selected staff
  const generateStaffBasedCalendar = () => {
    const works: EventInput[] = [];
    const staffAssignments = schedule?.assignments?.filter(
      (assignment) => assignment.staffId === selectedStaffId
    );

    for (let i = 0; i < (staffAssignments?.length || 0); i++) {
      const assignment = staffAssignments[i];
      const className = schedule?.shifts?.findIndex(
        (shift) => shift.id === assignment.shiftId
      );

      const assignmentDate = dayjs
        .utc(assignment.shiftStart)
        .format("YYYY-MM-DD");
      const isValidDate =
        getCalendarValidDates(schedule).includes(assignmentDate);

      const work = {
        id: assignment.id,
        title: getShiftById(schedule, assignment.shiftId)?.name,
        duration: "01:00",
        date: assignmentDate,
        staffId: assignment.staffId,
        shiftId: assignment.shiftId,
        className: `event ${classes[className]} ${
          getAssignmentById(schedule, assignment.id)?.isUpdated
            ? "highlight"
            : ""
        } ${!isValidDate ? "invalid-date" : ""}`,
      };
      works.push(work);
    }

    // Get highlighted dates (off days)
    const offDays = schedule?.staffs?.find(
      (staff) => staff.id === selectedStaffId
    )?.offDays;
    const dates = getDatesBetween(
      dayjs(schedule.scheduleStartDate).format("DD.MM.YYYY"),
      dayjs(schedule.scheduleEndDate).format("DD.MM.YYYY")
    );
    const newHighlightedDates: string[] = [];

    dates.forEach((date: string) => {
      const transformedDate = dayjs(date, "DD-MM-YYYY").format("DD.MM.YYYY");
      if (offDays?.includes(transformedDate)) newHighlightedDates.push(date);
    });

    setHighlightedDates(newHighlightedDates);
    setEvents(works);

    // Get pair dates for selected staff
    const staffPairDates = getPairDatesForStaff(
      schedule,
      selectedStaffId || ""
    );
    setPairDates(staffPairDates);
  };

  // Handle event click
  const handleEventClick = (clickInfo: any) => {
    const eventId = clickInfo.event.id;
    const assignment = getAssignmentById(schedule, eventId);

    if (assignment) {
      const staff = getStaffById(schedule, assignment.staffId);
      const shift = getShiftById(schedule, assignment.shiftId);

      const eventDetails = {
        staffName: staff?.name || "Unknown Staff",
        shiftName: shift?.name || "Unknown Shift",
        date: dayjs(assignment.shiftStart).format("DD.MM.YYYY"),
        startTime: dayjs(assignment.shiftStart).format("HH:mm"),
        endTime: dayjs(assignment.shiftEnd).format("HH:mm"),
        assignmentId: assignment.id,
      };

      setSelectedEventDetails(eventDetails);
      setModalOpen(true);
    }
  };

  // Handle event drop
  const handleEventDrop = (info: any) => {
    const assignmentId = info.event.id;
    const newDate = info.event.start;

    const assignment = getAssignmentById(schedule, assignmentId);
    if (!assignment) return;

    const originalShiftStart = dayjs(assignment.shiftStart);
    const originalShiftEnd = dayjs(assignment.shiftEnd);

    // Keep original time, only change date
    const newShiftStart = dayjs(newDate)
      .hour(originalShiftStart.hour())
      .minute(originalShiftStart.minute())
      .second(originalShiftStart.second())
      .millisecond(originalShiftStart.millisecond());

    const newShiftEnd = dayjs(newDate)
      .hour(originalShiftEnd.hour())
      .minute(originalShiftEnd.minute())
      .second(originalShiftEnd.second())
      .millisecond(originalShiftEnd.millisecond());

    dispatch(
      updateAssignment({
        assignmentId,
        newShiftStart: newShiftStart.toISOString(),
        newShiftEnd: newShiftEnd.toISOString(),
        onSuccess: () => {
          console.log(
            `Success, updated, new date: ${newShiftEnd.toISOString()}`
          );
        },
        onError: (err: any) => {
          console.error("Failed to update assignment:", err);
          info.revert();
        },
      }) as any
    );
  };

  // Set initial date based on first event
  useEffect(() => {
    if (
      selectedStaffId &&
      schedule?.assignments &&
      schedule.assignments.length > 0
    ) {
      const firstEventDate = getFirstEventDate(schedule, selectedStaffId);
      setInitialDate(firstEventDate);

      // Prevent flushSync error by delaying navigation
      setTimeout(() => {
        if (calendarRef.current) {
          calendarRef.current.getApi().gotoDate(firstEventDate);
        }
      }, 0);
    }

    generateStaffBasedCalendar();
  }, [selectedStaffId, schedule]);

  // Create dynamic styles for staff pair dates
  useEffect(() => {
    const style = document.createElement("style");
    const css = Object.entries(staffColorMap)
      .map(
        ([staffId, color]) => `
      .highlighted-pair-staff-${staffId} {
        border-bottom: 5px solid ${color} !important;
      }
    `
      )
      .join("\n");

    style.innerHTML = css;
    style.id = "staff-colors-style";

    document.head.appendChild(style);

    return () => {
      const styleElement = document.getElementById("staff-colors-style");
      if (styleElement) {
        styleElement.remove();
      }
    };
  }, [staffColorMap]);

  return {
    events,
    highlightedDates,
    pairDates,
    initialDate,
    handleEventClick,
    handleEventDrop,
  };
};
