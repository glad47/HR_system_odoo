export function trackAttendanceDayShift(
  punches,
  startDateStr,
  endDateStr,
  allowanceMinutes = 15,
  calendars,
  employee
) {
  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);

  // Normalize punches into Date objects
  const punchTimes = punches.map(p => new Date(p.punch_time)).sort((a, b) => a - b);

  let fullDays = 0;
  let partialDays = 0;
  let absentDays = 0;
  const details = [];

  // Totals accumulator
  const totals = {
    minutesEarlyArrival: 0,
    minutesLateOnArrival: 0,
    minutesLeftEarly: 0,
    minutesOverworked: 0,
    missingInPunches: 0,
    missingOutPunches: 0,
    leftEarlyCount: 0,
    arrivedLateCount: 0,
    overworkedCount: 0
  };


  let currentDate = new Date(startDate);

  while (currentDate.getTime() <= endDate.getTime()) {
    const dateKey = currentDate.toISOString().split("T")[0];

    // Link employee to their calendar
    const employeeCalendar = Object.values(calendars).find(
      c => c.id === employee.resource_calendar_id[0]
    );

    const weekday = currentDate.getDay();
    const DAY_NAMES = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    const dayName = DAY_NAMES[weekday];

    // Get today’s ranges from the calendar
    const todaysRanges = employeeCalendar.days?.[dayName] || [];

    if (todaysRanges.length === 0) {
      fullDays++;
      details.push({
        date: dateKey,
        status: "Full",
        absent: false,
        arrivalTime: null,
        departureTime: null,
        arrivedLate: false,
        minutesLateOnArrival: 0,
        minutesEarlyArrival: 0,
        leftEarly: false,
        minutesLeftEarly: 0,
        didOverwork: false,
        minutesOverworked: 0,
        missingInPunch: false,
        missingOutPunch: false,
        holiday: true
      });
      currentDate.setDate(currentDate.getDate() + 1);
      continue;
    }


    
    // Build shift anchors (day shift: same day start/end)
    const shiftStart = new Date(`${dateKey}T${todaysRanges[0].from}`);
    const shiftEnd   = new Date(`${dateKey}T${todaysRanges[0].to}`);
      // Expand shift window by 3 hours before start and 3 hours after end
    const expandedShiftStart = new Date(shiftStart.getTime() - 4 * 60 * 60 * 1000);
    const expandedShiftEnd   = new Date(shiftEnd.getTime()   + 4 * 60 * 60 * 1000);

    // Collect punches within expanded window
    const punchesInShift = punchTimes.filter(
      t => t >= expandedShiftStart && t <= expandedShiftEnd
    );



    const inPunches = []
    const outPunches = []
    for (const punch of punchesInShift) {
      const hour = punch.getHours(); // 0–23

      if (hour >= 0 && hour < 12) {
        // 00:00 → 11:59
        inPunches.push(punch);
      } else {
        // 12:00 → 23:59
        outPunches.push(punch);
      }
    }



    
     // Pick IN from base day only, OUT from next day only
      const firstPunch = inPunches.length ? inPunches[0] : null;
      const lastPunch  = outPunches.length ? outPunches[outPunches.length - 1] : null;

      // Presence flags
      const hasIn  = !!firstPunch;
      const hasOut = !!lastPunch;

    // Compute metrics safely (0 if missing)
      const rawLate              = hasIn ? Math.max(0, Math.round((firstPunch - shiftStart) / 60000)) : 0;
      const earlyArrivalByMinutes= hasIn ? Math.max(0, Math.round((shiftStart - firstPunch) / 60000)) : 0;

      const rawEarlyLeave        = hasOut ? Math.max(0, Math.round((shiftEnd - lastPunch) / 60000)) : 0;
      const overworkByMinutes    = hasOut ? Math.max(0, Math.round((lastPunch - shiftEnd) / 60000)) : 0;

      const isLate     = hasIn  ? rawLate > allowanceMinutes : false;
      const leftEarly  = hasOut ? rawEarlyLeave > allowanceMinutes : false;
      const overworked = hasOut ? overworkByMinutes > 0 : false;

      // Derive status
      const status = hasIn && hasOut ? "Full" : hasIn || hasOut ? "Partial" : "Absent";

      // Update counters
      fullDays   += status === "Full"    ? 1 : 0;
      partialDays+= status === "Partial" ? 1 : 0;
      absentDays += status === "Absent"  ? 1 : 0;

      // Push detail
      const detail = {
          date: dateKey,
          status,
          absent: status === "Absent",

          // Punch times in 24h format
          arrivalTime:   hasIn  ? formatDateTime24(firstPunch) : null,
          departureTime: hasOut ? formatDateTime24(lastPunch)  : null,

          // Arrival-related metrics
          arrivedLate: hasIn ? isLate : false,
          minutesLateOnArrival: hasIn && isLate ? rawLate : 0,
          minutesEarlyArrival:  hasIn ? earlyArrivalByMinutes : 0,

          // Departure-related metrics
          leftEarly: hasOut ? leftEarly : false,
          minutesLeftEarly: hasOut && leftEarly ? rawEarlyLeave : 0,
          didOverwork: hasOut ? overworked : false,
          minutesOverworked: hasOut ? overworkByMinutes : 0,

          // New indicators
          missingInPunch:  !hasIn,
          missingOutPunch: !hasOut,
          holiday: false
        }
        details.push(detail);


        // 🔑 update totals immediately
        totals.minutesEarlyArrival   += detail.minutesEarlyArrival;
        totals.minutesLateOnArrival  += detail.minutesLateOnArrival;
        totals.minutesLeftEarly      += detail.minutesLeftEarly;
        totals.minutesOverworked     += detail.minutesOverworked;

        totals.missingInPunches      += detail.missingInPunch ? 1 : 0;
        totals.missingOutPunches     += detail.missingOutPunch ? 1 : 0;

        totals.leftEarlyCount        += detail.leftEarly ? 1 : 0;
        totals.arrivedLateCount      += detail.arrivedLate ? 1 : 0;
        totals.overworkedCount       += detail.didOverwork ? 1 : 0;



     currentDate.setDate(currentDate.getDate() + 1);
   }

     
  


      const salary = employee.salary;   // or however you get it
      const borrow = employee.borrow || 0;

      // 1. Late arrival deduction
      const deductionLate = (salary / 30 / 120) * totals.minutesLateOnArrival;

      // 2. Absent + missing punches deduction
      const missingPunches = totals.missingInPunches + totals.missingOutPunches;
      const deductionAbsent = (salary / 30) * (absentDays + (missingPunches / 2));

      // 3. Net salary
      const netSalary = salary - (deductionLate + deductionAbsent + borrow);

      // Now return everything together
      return {
        totalDays: fullDays + partialDays + absentDays,
        fullDays,
        partialDays,
        absentDays,
        details,
        totals,
        deductionLate,
        deductionAbsent,
        borrow,
        netSalary
      };
    
}



export function  trackAttendanceNightShift(
  punches,
  startDateStr,
  endDateStr,
  allowanceMinutes = 15,
  calendars,
  employee
) {
  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);

  // Normalize punches into Date objects
  const punchTimes = punches.map(p => new Date(p.punch_time)).sort((a, b) => a - b);

  let fullDays = 0;
  let partialDays = 0;
  let absentDays = 0;
  const details = [];

  // new totals accumulator
  const totals = {
    minutesEarlyArrival: 0,
    minutesLateOnArrival: 0,
    minutesLeftEarly: 0,
    minutesOverworked: 0,
    missingInPunches: 0,
    missingOutPunches: 0,
    leftEarlyCount: 0,
    arrivedLateCount: 0,
    overworkedCount: 0
  };


  let currentDate = new Date(startDate);
  
  while (currentDate.getTime() <= endDate.getTime()) {
    const dateKey = currentDate.toISOString().split("T")[0];
    const nextDay = new Date(currentDate);
 
    nextDay.setDate(nextDay.getDate() + 1);
    const nextDayStr = nextDay.toISOString().split("T")[0];
    // const dateKey = nextDay.toISOString().split("T")[0];


    // Link employee to their calendar
    const employeeCalendar = Object.values(calendars).find(
      c => c.id === employee.resource_calendar_id[0]
    );

    const weekday = currentDate.getDay();
    const DAY_NAMES = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    const dayName = DAY_NAMES[weekday];

    // Get today’s ranges from the calendar
    const todaysRanges = employeeCalendar.days?.[dayName] || [];

    if (todaysRanges.length === 0) {
      fullDays++;
      details.push({
        date: dateKey,
        status: "Full",
        absent: false,
        arrivalTime: null,
        departureTime: null,
        arrivedLate: false,
        minutesLateOnArrival: 0,
        minutesEarlyArrival: 0,
        leftEarly: false,
        minutesLeftEarly: 0,
        didOverwork: false,
        minutesOverworked: 0,
        missingInPunch: false,
        missingOutPunch: false,
        holiday: true
      });
      currentDate.setDate(currentDate.getDate() + 1);
      continue;
    }
    


     // Build shift anchors (day shift: same day start/end)
    const shiftStart = new Date(`${dateKey}T${todaysRanges[0].from}`);
    const shiftEnd   = new Date(`${nextDayStr}T${todaysRanges[0].to}`);
      // Expand shift window by 3 hours before start and 3 hours after end
    const expandedShiftStart = new Date(shiftStart.getTime() - 3 * 60 * 60 * 1000);
    const expandedShiftEnd   = new Date(shiftEnd.getTime()   + 3 * 60 * 60 * 1000);

    // Collect punches within expanded window
    const punchesInShift = punchTimes.filter(
      t => t  >= expandedShiftStart && t <= expandedShiftEnd
    );

    // Collect punches within this shift window
    // const punchesInShift = punchTimes.filter(t => t >= shiftStart && t <= shiftEnd);



  
    

      const inPunches = []
      const outPunches = []
      for (var punch of punchesInShift){
        
        if(punch.toISOString().split("T")[0] == dateKey){
          inPunches.push(punch)
        }else if(punch.toISOString().split("T")[0] == nextDayStr){
          outPunches.push(punch)
        }

      }



       

    

       // Pick IN from base day only, OUT from next day only
      const firstPunch = inPunches.length ? inPunches[0] : null;
      const lastPunch  = outPunches.length ? outPunches[outPunches.length - 1] : null;

      // Presence flags
      const hasIn  = !!firstPunch;
      const hasOut = !!lastPunch;

    // Compute metrics safely (0 if missing)
      const rawLate              = hasIn ? Math.max(0, Math.round((firstPunch - shiftStart) / 60000)) : 0;
      const earlyArrivalByMinutes= hasIn ? Math.max(0, Math.round((shiftStart - firstPunch) / 60000)) : 0;

      const rawEarlyLeave        = hasOut ? Math.max(0, Math.round((shiftEnd - lastPunch) / 60000)) : 0;
      const overworkByMinutes    = hasOut ? Math.max(0, Math.round((lastPunch - shiftEnd) / 60000)) : 0;

      const isLate     = hasIn  ? rawLate > allowanceMinutes : false;
      const leftEarly  = hasOut ? rawEarlyLeave > allowanceMinutes : false;
      const overworked = hasOut ? overworkByMinutes > 0 : false;

      // Derive status
      const status = hasIn && hasOut ? "Full" : hasIn || hasOut ? "Partial" : "Absent";

      // Update counters
      fullDays   += status === "Full"    ? 1 : 0;
      partialDays+= status === "Partial" ? 1 : 0;
      absentDays += status === "Absent"  ? 1 : 0;

      // Push detail
      const detail = {
          date: dateKey,
          status,
          absent: status === "Absent",

          // Punch times in 24h format
          arrivalTime:   hasIn  ? formatDateTime24(firstPunch) : null,
          departureTime: hasOut ? formatDateTime24(lastPunch)  : null,

          // Arrival-related metrics
          arrivedLate: hasIn ? isLate : false,
          minutesLateOnArrival: hasIn && isLate ? rawLate : 0,
          minutesEarlyArrival:  hasIn ? earlyArrivalByMinutes : 0,

          // Departure-related metrics
          leftEarly: hasOut ? leftEarly : false,
          minutesLeftEarly: hasOut && leftEarly ? rawEarlyLeave : 0,
          didOverwork: hasOut ? overworked : false,
          minutesOverworked: hasOut ? overworkByMinutes : 0,

          // New indicators
          missingInPunch:  !hasIn,
          missingOutPunch: !hasOut,
          holiday: false
        }
        details.push(detail);


        // 🔑 update totals immediately
        totals.minutesEarlyArrival   += detail.minutesEarlyArrival;
        totals.minutesLateOnArrival  += detail.minutesLateOnArrival;
        totals.minutesLeftEarly      += detail.minutesLeftEarly;
        totals.minutesOverworked     += detail.minutesOverworked;

        totals.missingInPunches      += detail.missingInPunch ? 1 : 0;
        totals.missingOutPunches     += detail.missingOutPunch ? 1 : 0;

        totals.leftEarlyCount        += detail.leftEarly ? 1 : 0;
        totals.arrivedLateCount      += detail.arrivedLate ? 1 : 0;
        totals.overworkedCount       += detail.didOverwork ? 1 : 0;



     currentDate.setDate(currentDate.getDate() + 1);
   }

     
  


      const salary = employee.salary;   // or however you get it
      const borrow = employee.borrow || 0;

      // 1. Late arrival deduction
      const deductionLate = (salary / 30 / 120) * totals.minutesLateOnArrival;

      // 2. Absent + missing punches deduction
      const missingPunches = totals.missingInPunches + totals.missingOutPunches;
      const deductionAbsent = (salary / 30) * (absentDays + (missingPunches / 2));

      // 3. Net salary
      const netSalary = salary - (deductionLate + deductionAbsent + borrow);

      // Now return everything together
      return {
        totalDays: fullDays + partialDays + absentDays,
        fullDays,
        partialDays,
        absentDays,
        details,
        totals,
        deductionLate,
        deductionAbsent,
        borrow,
        netSalary
      };
   


}



export function formatDateTime24(date) {
  return date.toLocaleString("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false   // ✅ force 24-hour format
  });
}