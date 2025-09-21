// utils/calendar.js
import axios from "axios";

// helper: convert float hours to "HH:MM:SS"
export function floatToTimeString(floatHour) {
  const hours = Math.floor(floatHour);
  const minutes = Math.round((floatHour - hours) * 60);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`;
}

export async function makeTheCalendarInfo() {
  const rawSession = localStorage.getItem("sessionData");
  const ses = rawSession ? JSON.parse(rawSession) : null;

  if (!ses || !ses.token) {
    return [];
  }

  // 1. Fetch calendars
  const result = await axios.post("/jsonrpc", {
    jsonrpc: "2.0",
    method: "call",
    params: {
      service: "object",
      method: "execute_kw",
      args: [
        "odoo",
        ses.uid,
        ses.password,
        "resource.calendar",
        "search_read",
        [[]],
        { fields: ["name", "attendance_ids", "hours_per_day"] }
      ]
    },
    id: Date.now()
  });

  const calendarInfo = result.data.result;

  // 2. Collect all attendance IDs
  const allAttendanceIds = calendarInfo.flatMap(c => c.attendance_ids);

  // 3. Fetch attendances
  const attendanceRes = await axios.post("/jsonrpc", {
    jsonrpc: "2.0",
    method: "call",
    params: {
      service: "object",
      method: "execute_kw",
      args: [
        "odoo",
        ses.uid,
        ses.password,
        "resource.calendar.attendance",
        "read",
        [allAttendanceIds],
        { fields: ["dayofweek", "hour_from", "hour_to"] }
      ]
    },
    id: Date.now()
  });

  const attendanceInfo = attendanceRes.data.result;

  // 4. Build lookup map
  const attendanceMap = {};
  for (const att of attendanceInfo) {
    attendanceMap[att.id] = att;
  }

  // 5. Combine calendar + attendance data
  const combined = calendarInfo.map(cal => {
    const days = {};
    cal.attendance_ids.forEach(attId => {
      const att = attendanceMap[attId];
      if (att) {
        const dayName = [
          "Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"
        ][parseInt(att.dayofweek)];
        if (!days[dayName]) days[dayName] = [];
        days[dayName].push({
          from: floatToTimeString(att.hour_from),
          to: floatToTimeString(att.hour_to)
        });
      }
    });

    // Merge overnight ranges (19–24 + 0–7 → 19–7)
    for (const [dayName, ranges] of Object.entries(days)) {
      const hasEvening = ranges.find(r => r.from === "19:00:00" && r.to === "24:00:00");
      const hasMorning = ranges.find(r => r.from === "00:00:00" && r.to === "07:00:00");
      if (hasEvening && hasMorning) {
        days[dayName] = [{ from: "19:00:00", to: "07:00:00", overnight: true }];
      }
    }

    return {
      id: cal.id,
      name: cal.name,
      hours_per_day: cal.hours_per_day,
      days
    };
  });

  return combined;
}
