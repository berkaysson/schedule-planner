/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useRef, useState } from "react";

import { useDispatch } from "react-redux";

import type { ScheduleInstance } from "../../models/schedule";
import type { UserInstance } from "../../models/user";

import FullCalendar from "@fullcalendar/react";

import interactionPlugin from "@fullcalendar/interaction";
import dayGridPlugin from "@fullcalendar/daygrid";

import type { EventInput } from "@fullcalendar/core/index.js";

import "../profileCalendar.scss";
import EventDetailModal from "../EventDetailModal";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import customParseFormat from "dayjs/plugin/customParseFormat";

import { updateAssignment } from "../../store/schedule/actions";

dayjs.extend(utc);
dayjs.extend(isSameOrBefore);
dayjs.extend(customParseFormat); // farklı tarih formatlarını kullanabilmek için, pair dates için gerekli

type CalendarContainerProps = {
  schedule: ScheduleInstance;
  auth: UserInstance;
};

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

const staffColors = [
  "#927212",
  "#ff8847",
  "#5e5e20",
  "#32a852",
  "#32a8a2",
  "#327ba8",
  "#3244a8",
  "#5a32a8",
  "#a832a4",
  "#6b690a",
  "#c2068a",
  "#c28d06",
  "#a2c206",
  "#3ea813",
  "#108f7c",
  "#10278f",
  "#51108f",
  "#118f22",
  "#620878",
  "#40690a",
  "#175a45",
  "#09aa1d",
  "#60d3e1",
  "#8de149",
  "#74db6c",
  "#47216b",
  "#447804",
  "#933862",
  "#7ff932",
  "#2a7626",
  "#b6065f",
  "#52e6d3",
  "#c8b062",
  "#a749b7",
  "#13249d",
  "#01c40b",
  "#2e6332",
  "#70ae19",
  "#b3524c",
];

const CalendarContainer = ({ schedule, auth }: CalendarContainerProps) => {
  const calendarRef = useRef<FullCalendar>(null);
  const dispatch = useDispatch();

  const [events, setEvents] = useState<EventInput[]>([]);
  const [highlightedDates, setHighlightedDates] = useState<string[]>([]);
  const [pairDates, setPairDates] = useState<{ [key: string]: string }>({}); // date -> staffId'ye map
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [initialDate, setInitialDate] = useState<Date>(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEventDetails, setSelectedEventDetails] = useState<any>(null);
  const [staffColorMap, setStaffColorMap] = useState<{ [key: string]: string }>(
    {}
  );

  const getPlugins = () => {
    const plugins = [dayGridPlugin];

    plugins.push(interactionPlugin);
    return plugins;
  };

  const getShiftById = (id: string) => {
    return schedule?.shifts?.find((shift: { id: string }) => id === shift.id);
  };

  const getAssigmentById = (id: string) => {
    return schedule?.assignments?.find((assign) => id === assign.id);
  };

  const getStaffById = (id: string) => {
    return schedule?.staffs?.find((staff) => id === staff.id);
  };

  const validDates = () => {
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

  const getDatesBetween = (startDate: string, endDate: string) => {
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

  const getFirstEventDate = () => {
    if (!schedule?.assignments || schedule.assignments.length === 0) {
      return dayjs(schedule?.scheduleStartDate).toDate();
    }
    // Sadece seçili personelin etkinliklerine göre filtreleme
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

  const handleEventClick = (clickInfo: any) => {
    const eventId = clickInfo.event.id;
    const assignment = getAssigmentById(eventId);

    if (assignment) {
      const staff = getStaffById(assignment.staffId);
      const shift = getShiftById(assignment.shiftId);

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

  const handleEventDrop = (info: any) => {
    const assignmentId = info.event.id;
    const newDate = info.event.start;

    const assignment = getAssigmentById(assignmentId);
    if (!assignment) return;

    const originalShiftStart = dayjs(assignment.shiftStart);
    const originalShiftEnd = dayjs(assignment.shiftEnd);

    // Orijinal saat ve dakika değerlerini koru, sadece tarihi değiştir
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

  // Her personeli renkleriyle eşleştir
  useEffect(() => {
    if (schedule?.staffs && schedule.staffs.length > 0) {
      const colorMap: { [key: string]: string } = {};
      schedule.staffs.forEach((staff, index) => {
        colorMap[staff.id] = staffColors[index % staffColors.length];
      });
      setStaffColorMap(colorMap);
    }
  }, [schedule?.staffs]);

  const getPairDatesForStaff = (staffId: string) => {
    const staff = getStaffById(staffId);
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
      const isValidDate = validDates().includes(assignmentDate);

      const work = {
        id: assignment.id,
        title: getShiftById(assignment.shiftId)?.name,
        duration: "01:00",
        date: assignmentDate,
        staffId: assignment.staffId,
        shiftId: assignment.shiftId,
        className: `event ${classes[className]} ${
          getAssigmentById(assignment.id)?.isUpdated ? "highlight" : ""
        } ${!isValidDate ? "invalid-date" : ""}`,
      };
      works.push(work);
    }

    const offDays = schedule?.staffs?.find(
      (staff) => staff.id === selectedStaffId
    )?.offDays;
    const dates = getDatesBetween(
      dayjs(schedule.scheduleStartDate).format("DD.MM.YYYY"),
      dayjs(schedule.scheduleEndDate).format("DD.MM.YYYY")
    );
    let highlightedDates: string[] = [];

    dates.forEach((date) => {
      const transformedDate = dayjs(date, "DD-MM-YYYY").format("DD.MM.YYYY");
      if (offDays?.includes(transformedDate)) highlightedDates.push(date);
    });

    setHighlightedDates(highlightedDates);
    setEvents(works);

    // Seçili personelin pair tarihlerini al
    const staffPairDates = getPairDatesForStaff(selectedStaffId || "");
    setPairDates(staffPairDates);
  };

  // Personel renkleri için dinamik CSS oluştur
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

  // takvim varsayılan tarihi ilk evente göre ayarlandı
  useEffect(() => {
    if (schedule?.staffs && schedule.staffs.length > 0 && !selectedStaffId) {
      setSelectedStaffId(schedule.staffs[0].id);
    }
  }, [schedule?.staffs]);

  useEffect(() => {
    if (
      selectedStaffId &&
      schedule?.assignments &&
      schedule.assignments.length > 0
    ) {
      const firstEventDate = getFirstEventDate();
      setInitialDate(firstEventDate);

      // ilk renderda çalışmasını önleyerek flusySync hatası giderildi
      setTimeout(() => {
        if (calendarRef.current) {
          calendarRef.current.getApi().gotoDate(firstEventDate);
        }
      }, 0);
    }

    generateStaffBasedCalendar();
  }, [selectedStaffId, schedule]);

  const RenderEventContent = ({ eventInfo }: any) => {
    return (
      <div className="event-content">
        <p>{eventInfo.event.title}</p>
      </div>
    );
  };

  const getStaffColor = (staffId: string) => {
    return staffColorMap[staffId] || "#19979c";
  };

  return (
    <div className="calendar-section">
      <div className="calendar-wrapper">
        <div className="staff-list">
          {schedule?.staffs?.map((staff: any) => {
            const staffColor = getStaffColor(staff.id);

            return (
              <div
                key={staff.id}
                onClick={() => setSelectedStaffId(staff.id)}
                className={`staff ${staff.id && selectedStaffId}`}
                style={{
                  borderWidth: "2px",
                  borderColor: staffColor,
                  backgroundColor:
                    staff.id === selectedStaffId ? staffColor : "#ffffff",
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="20px"
                  viewBox="0 -960 960 960"
                  width="20px"
                >
                  <path
                    fill={staff.id === selectedStaffId ? "#ffffff" : staffColor}
                    d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-160v-112q0-34 17-62.5t47-43.5q60-30 124.5-46T480-440q67 0 131.5 16T736-378q30 15 47 43.5t17 62.5v112H160Zm320-400q33 0 56.5-23.5T560-640q0-33-23.5-56.5T480-720q-33 0-56.5 23.5T400-640q0 33 23.5 56.5T480-560Zm160 228v92h80v-32q0-11-5-20t-15-14q-14-8-29.5-14.5T640-332Zm-240-21v53h160v-53q-20-4-40-5.5t-40-1.5q-20 0-40 1.5t-40 5.5ZM240-240h80v-92q-15 5-30.5 11.5T260-306q-10 5-15 14t-5 20v32Zm400 0H320h320ZM480-640Z"
                  />
                </svg>
                <span>{staff.name}</span>
              </div>
            );
          })}
        </div>
        <FullCalendar
          ref={calendarRef}
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
          eventClick={handleEventClick}
          eventDrop={handleEventDrop}
          eventContent={(eventInfo: any) => (
            <RenderEventContent eventInfo={eventInfo} />
          )}
          datesSet={() => {
            if (
              calendarRef?.current?.getApi().getDate() &&
              !dayjs(schedule?.scheduleStartDate).isSame(
                calendarRef?.current?.getApi().getDate()
              )
            )
              setInitialDate(calendarRef?.current?.getApi().getDate());
          }}
          dayCellContent={({ date }) => {
            const found = validDates().includes(
              dayjs(date).format("YYYY-MM-DD")
            );
            const isHighlighted = highlightedDates.includes(
              dayjs(date).format("DD-MM-YYYY")
            );
            const dateStr = dayjs(date).format("DD-MM-YYYY");
            const pairStaffId = pairDates[dateStr];

            return (
              <div
                className={`${found ? "" : "date-range-disabled"} ${
                  isHighlighted ? "highlighted-date-orange" : ""
                } ${
                  pairStaffId ? `highlighted-pair-staff-${pairStaffId}` : ""
                }`}
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
      </div>

      <EventDetailModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        eventDetails={selectedEventDetails}
      />
    </div>
  );
};

export default CalendarContainer;
