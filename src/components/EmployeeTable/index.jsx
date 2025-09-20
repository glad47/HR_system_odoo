import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Drawer } from 'antd';
import { createStyles } from 'antd-style';
import EmployeeFilter from '../EmployeeFilter';
import { Tag } from "antd";
import EmployeeDrawer from '../EmployeeDrawer';
import { getCachedTransactions, saveTransactionsToCache } from "../../utils/transactionCache";
import {getCurrentCustomMonth} from "../../utils/dateRanges"





const useStyle = createStyles(({ css, token }) => {
  const { antCls } = token;


  




  return {
    customTable: css`
      ${antCls}-table {
        ${antCls}-table-container {
          ${antCls}-table-body,
          ${antCls}-table-content {
            scrollbar-width: thin;
            scrollbar-color: #eaeaea transparent;
            scrollbar-gutter: stable;
          }
        }
      }
    `,
  };
});




const EmployeeTable = () => {
  const { styles } = useStyle();

  const [employees, setEmployees] = useState([]); 
  const [transactions, setTransactions] = useState([]); 
  
  const [total, setTotal] = useState(0);              
  const [currentPage, setCurrentPage] = useState(1);   
  const [pageSize, setPageSize] = useState(50);       
  const [session, setSession] = useState({})
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({});

  const [open, setOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null)


  const [dayStartTime, setDayStartTime] = useState(null);
  const [dayEndTime, setDayEndTime] = useState(null);
  const [nightStartTime, setNightStartTime] = useState(null);
  const [nightEndTime, setNightEndTime] = useState(null);

  


  const showDetails = async (record) => {
    setSelectedEmployee(record);
    setOpen(true);

    const empCode = record.registration_number;
    const monthName = getCurrentCustomMonth(new Date().getFullYear())?.name || "Unknown";

    // 1. Try cache
    const cached = getCachedTransactions(empCode, monthName);
    console.log("cvcvcvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv")
    console.log(cached)
    if (cached) {
      record.transactions = cached
     
    }else{
      // 2. Fetch if not cached
      const tx = await fetchTransactions(session.token, record);
      record.transactions = tx;

      // 3. Save to cache
      saveTransactionsToCache(empCode, monthName, tx);
    }

   
  };


  const colors = [
  "blue", "green", "red", "purple", "orange",
  "magenta", "volcano", "cyan", "geekblue", "gold", "lime"
];

function getColorForDepartment(name) {
  if (!name) return "default";
  // Simple hash: sum char codes → pick color
  const hash = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return colors[hash % colors.length];
}



    const columns = [
    {
        title: 'ID',
        dataIndex: 'registration_number',
        key: 'registration_number',
        render: (text) => text || '—', // show dash if false/null
      },
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: 'Work Schedule',
        dataIndex: 'resource_calendar_id',
        key: 'resource_calendar_id',
        render: (value) => (Array.isArray(value) ? value[1] : '—'),
      },
      {
        title: "Department",
        dataIndex: "department_id",
        key: "department_id",
        render: (val) => {
          if (!val || !Array.isArray(val)) return <Tag>No Department</Tag>;
          const deptName = val[1];
          return <Tag color={getColorForDepartment(deptName)}>{deptName}</Tag>;
        },
      },
      {
        title: "Action",
        key: "action",
        render: (_, record) => (
          <Button type="link" onClick={() => showDetails(record)}>
            More Details
          </Button>
        ),
      },
    ];

  

  const navigate = useNavigate();



  useEffect(() => {
      const rawSession = localStorage.getItem('sessionData');
      const ses = rawSession ? JSON.parse(rawSession) : null;

      if (!ses || !ses.token) {
        navigate('/');
        return;
      }

      setSession(ses)

      fetchEmployees(ses.token , ses.uid, ses.password, currentPage, pageSize)

  
  }, [navigate, currentPage]);



  const extractPageNumber = (url) => {
    if (!url) return null;
    try {
      const params = new URL(url).searchParams;
      return parseInt(params.get('page'), 10);
    } catch {
      return null;
    }
  };






  const handleSearch = (values) => {
    setLoading(true);
    
    setDayStartTime(values.day_start_time);
    setDayEndTime(values.day_end_time);
    setNightStartTime(values.night_start_time);
    setNightEndTime(values.night_end_time);

    setFilters(values);
    
  };


  useEffect(() => {
    setCurrentPage(1);
    fetchEmployees( session.token, session.uid, session.password, 1, pageSize);
    console.log(filters)
  }, [filters])






  // useEffect(() => {
  //   const getTranscation = async () => {
  //      const results = await Promise.all(
  //         employees.map(async (emp) => {
  //           const transactions = await fetchTransactions(session.token, emp);
  //           console.log("call from the fetch data");
  //           console.log(transactions);
  //           return { ...emp, transactions }; // return a new object with transactions
  //         })
  //       );

  //       console.log(results)  
  //   }
  //    if(session && employees && dayStartTime && dayEndTime && nightStartTime && nightEndTime){
       
  //       getTranscation();
  //    }

  // },
  // [session, employees, dayStartTime, dayEndTime,  nightStartTime, nightEndTime ])





//   const  fetchTransactions = async (authToken) => {
//   // setLoading(true); // Start spinner
//   try {
//     const response = await axios.get(`/iclock/api/transactions/`, {
//       headers: {
//         Authorization: `Token ${authToken}`,
//         'Content-Type': 'application/json',
//       },
//       params: {
//         page_size: "10",
//         start_time: '2025-08-26 00:00:00',
//         end_time: '2025-09-25 23:59:59',
//       },
//     });

//     console.log(response)
//     const {data } = response.data;
//     console.log(data)
  

//     setTransactions(data);
//     // setTotal(count);

//     // const nextPage = extractPageNumber(next);
//     // const prevPage = extractPageNumber(previous);

//     // console.log("Next page:", nextPage);
//     // console.log("Previous page:", prevPage);
//   } catch (err) {
//     navigate('/');
//     console.log("xvcxvcxcxvcvxcvvxvxvxvcvcxvxcvcx")
//     console.log(err)

//     console.error("Fetch failed:", err);
//   }finally {
//     setLoading(false); // Stop spinner
//   }
// };

function getEmployeeShiftRanges(employee) {
    const calendarName = employee?.resource_calendar_id?.[1] || "";

    // Find the current month ranges

    let param = {};

    if (calendarName.includes("صباحا")) {
      param.start_time=  dayStartTime;
      param.end_time = dayEndTime;

    } else if (calendarName.includes("مساءا")) {
      param.start_time=  nightStartTime;
      param.end_time = nightEndTime;
    } else {
      // fallback to day shift
      param.start_time=  dayStartTime;
      param.end_time = dayEndTime;
    }

    param.page_size= 1000;
    param.emp_code= employee?.registration_number

    return param;
}



const fetchTransactions = async (authToken, employee) => {
  const params = getEmployeeShiftRanges(employee)
  try {
    const response = await axios.get(`/iclock/api/transactions/`, {
      headers: {
        Authorization: `Token ${authToken}`,
        'Content-Type': 'application/json',
      },
      params,
    });

    const { data } = response.data;
    return data; // return transactions for this employee
  } catch (err) {
    console.error("Fetch failed:", err);
    return [];
  }
};


const fetchEmployees = async (token,uid, password, page = 1, pageSize = 50) => {
  setLoading(true);
  try {
    const offset = (page - 1) * pageSize;


    // Build domain dynamically
      const domain = [];
      if (filters.name) {
        domain.push(["name", "ilike", filters.name]); // case-insensitive match
      }
      if (filters.registration_number) {
        domain.push(["registration_number", "=", filters.registration_number]);
      }
      if(filters.department_id){
         domain.push(["department_id", "=", filters.department_id]);
      }

      domain.push(["registration_number", "!=", false])

    const response = await axios.post("/jsonrpc", {
      jsonrpc: "2.0",
      method: "call",
      params: {
        service: "object",
        method: "execute_kw",
        args: [
          "odoo",          // database
          uid,             // user id from authenticate
          password,        // password
          "hr.employee",   // model
          "search_read",   // method
          [domain],
          {
            fields: ["name", "registration_number", "resource_calendar_id",  "department_id"],
            offset,
            limit: pageSize
          }
        ]
      },
      id: 1
    });


    const employees = response.data.result || [];

    

    
    setEmployees(employees);

    // ⚠️ Odoo does not return total count with search_read
    // You need a separate search_count call to get total
    const countRes = await axios.post("/jsonrpc", {
      jsonrpc: "2.0",
      method: "call",
      params: {
        service: "object",
        method: "execute_kw",
        args: [
          "odoo",
          uid,
          password,
          "hr.employee",
          "search_count",
          [domain]
        ]
      },
      id: 2
    });

    setTotal(countRes.data.result);

    

  } catch (err) {
    console.error("Odoo fetch failed:", err);
  } finally {
    setLoading(false);
  }
};






      const trackAttendance = (
      punches,
      startTimeStr,
      endTimeStr,
      workStart = '09:00:00',
      workEnd = '18:00:00',
      allowanceMinutes = 15
    ) => {
      const startDate = new Date(startTimeStr);
      const endDate = new Date(endTimeStr);
      const attendanceMap = new Map();

      // Group punches by date
      punches.forEach(punch => {
        const punchDateTime = new Date(punch.punch_time);
        const punchDateKey = punchDateTime.toISOString().split('T')[0];
        if (!attendanceMap.has(punchDateKey)) {
          attendanceMap.set(punchDateKey, []);
        }
        attendanceMap.get(punchDateKey).push(punchDateTime);
      });

      let fullDays = 0;
      let partialDays = 0;
      let absentDays = 0;
      const details = [];

      // Generate all dates in range (fixed loop)
      let currentDate = new Date(startDate);
      while (currentDate.getTime() <= endDate.getTime()) {
        const dateKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
        const punchTimes = attendanceMap.get(dateKey) || [];

        if (punchTimes.length === 0) {
          absentDays++;
          details.push({
            date: dateKey,
            status: 'Absent',
            absent: true,
            firstPunch: null,
            lastPunch: null,
            isLate: false,
            lateByMinutes: 0,
            earlyArrivalByMinutes: 0,
            leftEarly: false,
            earlyByMinutes: 0,
            overworked: false,
            overworkByMinutes: 0,
            missingOutPunch: false,
            missingInPunch: false
          });
          currentDate.setDate(currentDate.getDate() + 1);
          continue;
        }

        punchTimes.sort((a, b) => a - b);
        const firstPunch = punchTimes[0];
        const lastPunch = punchTimes[punchTimes.length - 1];

        const workStartTime = new Date(`${dateKey}T${workStart}`);
        const workEndTime = new Date(`${dateKey}T${workEnd}`);
        const workMidTime = new Date((workStartTime.getTime() + workEndTime.getTime()) / 2);

        let rawLate = 0;
        let earlyArrivalByMinutes = 0;
        let rawEarlyLeave = 0;
        let overworkByMinutes = 0;
        let isLate = false;
        let leftEarly = false;
        let overworked = false;
        let missingOutPunch = false;
        let missingInPunch = false;

        if (punchTimes.length >= 2) {
          rawLate = firstPunch > workStartTime
            ? Math.round((firstPunch - workStartTime) / 60000)
            : 0;

          earlyArrivalByMinutes = firstPunch < workStartTime
            ? Math.round((workStartTime - firstPunch) / 60000)
            : 0;

          rawEarlyLeave = lastPunch < workEndTime
            ? Math.round((workEndTime - lastPunch) / 60000)
            : 0;

          overworkByMinutes = lastPunch > workEndTime
            ? Math.round((lastPunch - workEndTime) / 60000)
            : 0;

          isLate = rawLate > allowanceMinutes;
          leftEarly = rawEarlyLeave > allowanceMinutes;
          overworked = overworkByMinutes > allowanceMinutes;
        } else {
          if (firstPunch < workMidTime) {
            rawLate = firstPunch > workStartTime
              ? Math.round((firstPunch - workStartTime) / 60000)
              : 0;

            earlyArrivalByMinutes = firstPunch < workStartTime
              ? Math.round((workStartTime - firstPunch) / 60000)
              : 0;

            isLate = rawLate > allowanceMinutes;
            missingOutPunch = true;
          } else {
            rawEarlyLeave = lastPunch < workEndTime
              ? Math.round((workEndTime - lastPunch) / 60000)
              : 0;

            overworkByMinutes = lastPunch > workEndTime
              ? Math.round((lastPunch - workEndTime) / 60000)
              : 0;

            leftEarly = rawEarlyLeave > allowanceMinutes;
            overworked = overworkByMinutes > allowanceMinutes;
            missingInPunch = true;
          }
        }

        const lateByMinutes = isLate ? rawLate : 0;
        const earlyByMinutes = leftEarly ? rawEarlyLeave : 0;

        const status = punchTimes.length >= 2 ? 'Full' : 'Partial';
        if (status === 'Full') fullDays++;
        else partialDays++;

        details.push({
          date: dateKey,
          status,
          absent: false,
          firstPunch: firstPunch.toLocaleTimeString(),
          lastPunch: lastPunch.toLocaleTimeString(),
          isLate,
          lateByMinutes,
          earlyArrivalByMinutes,
          leftEarly,
          earlyByMinutes,
          overworked,
          overworkByMinutes,
          missingOutPunch,
          missingInPunch
        });

        currentDate.setDate(currentDate.getDate() + 1);
      }

      return {
        totalDays: fullDays + partialDays + absentDays,
        fullDays,
        partialDays,
        absentDays,
        datesPresent: details.map(d => d.date),
        details
      };
    };




  return (
  //  <Table
  //     columns={columns}
  //     dataSource={transactions}
  //     loading={loading} 
  //     pagination={{
  //       current: currentPage,
  //       pageSize,
  //       total,
  //       showSizeChanger: true,
  //       onChange: (page) => {
  //         setCurrentPage(page);
  //         fetchTransactions(session.token, page, pageSize);
  //       },
  //       onShowSizeChange: (current, size) => {
  //         setPageSize(size);
  //         fetchTransactions(session.token, current, size);
  //       }
  //     }}

  //     rowKey="id"
  //     scroll={{ y: 55 * 5 }}
  //   />
  <>
     <EmployeeFilter onSearch={handleSearch} session={session}/>

      <Table
        columns={columns}
        dataSource={employees}
        loading={loading}
        pagination={{
          current: currentPage,
          pageSize,
          total,
          showSizeChanger: true,
          onChange: (page) => {
            setCurrentPage(page);
            fetchEmployees(session.uid, session.password, page, pageSize);
          },
          onShowSizeChange: (current, size) => {
            setPageSize(size);
            fetchEmployees(session.uid, session.password, current, size);
          }
        }}
        rowKey="id"
      />

      {/* Drawer Component */}
      <EmployeeDrawer
        open={open}
        onClose={() => setOpen(false)}
        employee={selectedEmployee}
        transactions={selectedEmployee?.transactions}
      />

  </>

 


  );
};
export default EmployeeTable;