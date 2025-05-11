import { useEffect, useState } from "react";

import type { ScheduleInstance } from "../../../models/schedule";

// Colors for different staff members
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

export const useStaffColors = (schedule: ScheduleInstance | null) => {
  const [staffColorMap, setStaffColorMap] = useState<{ [key: string]: string }>(
    {}
  );

  useEffect(() => {
    if (schedule?.staffs && schedule.staffs.length > 0) {
      const colorMap: { [key: string]: string } = {};
      schedule.staffs.forEach((staff, index) => {
        colorMap[staff.id] = staffColors[index % staffColors.length];
      });
      setStaffColorMap(colorMap);
    }
  }, [schedule?.staffs]);

  return { staffColorMap };
};
