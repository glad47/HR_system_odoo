// utils/dateRanges.js

// --- Helpers ---
export const pad = (n) => String(n).padStart(2, "0");

export const formatDateLocal = (date) => {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
    date.getSeconds()
  )}`;
};

// --- Day Shift Range (26th 00:00 → 25th 23:59) ---
export function getCustomMonthRange(year, monthIndex) {
  let startMonth = monthIndex - 1;
  let startYear = year;
  if (startMonth < 0) {
    startMonth = 11;
    startYear = year - 1;
  }
  const startDate = new Date(startYear, startMonth, 26, 0, 0, 0);
  const endDate = new Date(year, monthIndex, 25, 23, 59, 59);
  return { startDate, endDate };
}

export function getAllCustomMonths(year) {
  const names = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];
  return names.map((name, idx) => {
    const { startDate, endDate } = getCustomMonthRange(year, idx);
    return {
      name,
      start: formatDateLocal(startDate),
      end: formatDateLocal(endDate),
    };
  });
}

export function getCurrentCustomMonth(year) {
  const list = getAllCustomMonths(year);
  const today = new Date();
  return list.find(
    (m) => today >= new Date(m.start) && today <= new Date(m.end)
  );
}

// --- Night Shift Range (26th 19:00 → 26th next month 06:59) ---
export function getCustomMonthRangeNight(year, monthIndex) {
  let startMonth = monthIndex - 1;
  let startYear = year;
  if (startMonth < 0) {
    startMonth = 11;
    startYear = year - 1;
  }
  const startDate = new Date(startYear, startMonth, 26, 19, 0, 0);
  const endDate = new Date(year, monthIndex, 26, 6, 59, 59);
  return { startDate, endDate };
}

export function getAllCustomMonthsNight(year) {
  const names = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];
  return names.map((name, idx) => {
    const { startDate, endDate } = getCustomMonthRangeNight(year, idx);
    return {
      name,
      start: formatDateLocal(startDate),
      end: formatDateLocal(endDate),
    };
  });
}

export function getCurrentCustomMonthNight(year) {
  const list = getAllCustomMonthsNight(year);
  const now = new Date();
  return list.find(
    (m) => now >= new Date(m.start) && now <= new Date(m.end)
  );
}
