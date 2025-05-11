/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import type { ScheduleInstance } from "../../models/schedule";
import type { UserInstance } from "../../models/user";
import EventDetailModal from "../EventDetailModal";
import StaffList from "./StaffList";
import Calendar from "./Calendar";
import { useCalendar } from "./hooks/useCalendar";
import { useStaffColors } from "./hooks/useStaffColors";
import "../profileCalendar.scss";
import type FullCalendar from "@fullcalendar/react";

type CalendarContainerProps = {
  schedule: ScheduleInstance;
  auth: UserInstance;
};

const CalendarContainer = ({ schedule, auth }: CalendarContainerProps) => {
  const calendarRef = useRef<FullCalendar>(null);
  const dispatch = useDispatch();

  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEventDetails, setSelectedEventDetails] = useState<any>(null); // for event dialog

  const { staffColorMap } = useStaffColors(schedule); // custom hook for colors of staff members
  const {
    events,
    highlightedDates,
    pairDates,
    initialDate,
    handleEventClick,
    handleEventDrop,
  } = useCalendar({
    schedule,
    selectedStaffId,
    staffColorMap,
    calendarRef,
    dispatch,
    setModalOpen,
    setSelectedEventDetails,
  }); // custom hook for managing events, highlighted dates, and pair dates

  // Initialize selected staff
  useEffect(() => {
    if (schedule?.staffs && schedule.staffs.length > 0 && !selectedStaffId) {
      setSelectedStaffId(schedule.staffs[0].id);
    }
  }, [schedule?.staffs]);

  return (
    <div className="calendar-section">
      <div className="calendar-wrapper">
        {/* Selectable buttons for Staff List */}
        <StaffList
          staffs={schedule?.staffs || []}
          selectedStaffId={selectedStaffId}
          onStaffSelect={setSelectedStaffId}
          staffColorMap={staffColorMap}
        />

        {/* Calendar */}
        <Calendar
          ref={calendarRef}
          auth={auth}
          schedule={schedule}
          initialDate={initialDate}
          events={events}
          highlightedDates={highlightedDates}
          pairDates={pairDates}
          staffColorMap={staffColorMap}
          onEventClick={handleEventClick}
          onEventDrop={handleEventDrop}
        />
      </div>

      {/* Event Detail Modal */}
      <EventDetailModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        eventDetails={selectedEventDetails}
      />
    </div>
  );
};

export default CalendarContainer;
