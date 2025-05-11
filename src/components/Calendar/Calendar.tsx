/* eslint-disable @typescript-eslint/no-explicit-any */

import { forwardRef } from "react";
import FullCalendar from "@fullcalendar/react";
import interactionPlugin from "@fullcalendar/interaction";
import dayGridPlugin from "@fullcalendar/daygrid";
import type { EventInput } from "@fullcalendar/core/index.js";
import type { ScheduleInstance } from "../../models/schedule";
import type { UserInstance } from "../../models/user";
import { getCalendarValidDates } from "./utils/date";
import dayjs from "dayjs";
import "../profileCalendar.scss";

type CalendarProps = {
  auth: UserInstance;
  schedule: ScheduleInstance;
  initialDate: Date;
  events: EventInput[];
  highlightedDates: string[];
  pairDates: { [key: string]: string };
  staffColorMap: { [key: string]: string };
  onEventClick: (clickInfo: any) => void;
  onEventDrop: (info: any) => void;
};

const RenderEventContent = ({ eventInfo }: any) => {
  return (
    <div className="event-content">
      <p>{eventInfo.event.title}</p>
    </div>
  );
};

const Calendar = forwardRef<FullCalendar, CalendarProps>(
  (
    {
      auth,
      schedule,
      initialDate,
      events,
      highlightedDates,
      pairDates,
      staffColorMap,
      onEventClick,
      onEventDrop,
    },
    ref
  ) => {
    const getPlugins = () => {
      const plugins = [dayGridPlugin];
      plugins.push(interactionPlugin);
      return plugins;
    };

    const getStaffColor = (staffId: string) => {
      return staffColorMap[staffId] || "#19979c";
    };

    return (
      <FullCalendar
        ref={ref}
        locale={auth.language}
        plugins={getPlugins()}
        contentHeight={400}
        handleWindowResize={true}
        selectable={true}
        editable={true}
        eventOverlap={true}
        eventDurationEditable={false}
        initialView="dayGridMonth"
        initialDate={initialDate}
        events={events}
        firstDay={1}
        dayMaxEventRows={4}
        fixedWeekCount={true}
        showNonCurrentDates={true}
        eventClick={onEventClick}
        eventDrop={onEventDrop}
        eventContent={(eventInfo: any) => (
          <RenderEventContent eventInfo={eventInfo} />
        )}
        datesSet={() => {
          if (
            ref &&
            typeof ref !== "function" &&
            ref.current?.getApi().getDate() &&
            !dayjs(schedule?.scheduleStartDate).isSame(
              ref.current?.getApi().getDate()
            )
          ) {
            // Removed control for date range
          }
        }}
        dayCellContent={({ date }) => {
          const validDates = getCalendarValidDates(schedule);
          const found = validDates.includes(dayjs(date).format("YYYY-MM-DD"));
          const isHighlighted = highlightedDates.includes(
            dayjs(date).format("DD-MM-YYYY")
          );
          const dateStr = dayjs(date).format("DD-MM-YYYY");
          const pairStaffId = pairDates[dateStr];

          return (
            <div
              className={`${found ? "" : "date-range-disabled"} ${
                isHighlighted ? "highlighted-date-orange" : ""
              } ${pairStaffId ? `highlighted-pair-staff-${pairStaffId}` : ""}`}
              style={{
                borderBottom: pairStaffId
                  ? `5px solid ${getStaffColor(pairStaffId)}`
                  : undefined,
              }}
            >
              {dayjs(date).date()}
            </div>
          );
        }}
      />
    );
  }
);

Calendar.displayName = "Calendar";

export default Calendar;
