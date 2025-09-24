import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Drawer } from 'antd';
import { createStyles } from 'antd-style';
import EmployeeFilter from '../EmployeeFilter';
import { Tag } from "antd";
import EmployeeDrawer from '../EmployeeDrawer';
import { getCachedTransactions, saveTransactionsToCache } from "../../utils/transactionCache";
import {getCurrentCustomMonth} from "../../utils/dateRanges"
import { trackAttendanceNightShift, trackAttendanceDayShift } from '../../utils/attendance';
import { makeTheCalendarInfo } from "../../utils/calendar";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";


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




const EmployeeTable = ({department}) => {
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
  const [calendarsIds, setCalendarsIds] = useState(null);
  const [calculating, setCalculating] = useState(false);
  const [employeeContracts, setEmployeeContracts] = useState([]);
  const hasFetchedSalary = useRef(false);


  


  const showDetails = async (record) => {
    setSelectedEmployee(record);
    setOpen(true);

    // const empCode = record.registration_number;
    // const monthName = getCurrentCustomMonth(new Date().getFullYear())?.name || "Unknown";

    // // 1. Try cache
    // const cached = getCachedTransactions(empCode, monthName);
    // if (cached) {
    //   record.transactions = cached
     
    // }else{
    //   // 2. Fetch if not cached
    //   const tx = await fetchTransactions(session.token, record);
    //   record.transactions = tx;

    //   // 3. Save to cache
    //   saveTransactionsToCache(empCode, monthName, tx);
    // }

   
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
    title: 'الرقم الوظيفي',
    dataIndex: 'registration_number',
    key: 'registration_number',
    render: (text) => text || '—', // عرض شرطة إذا كانت القيمة فارغة أو null
  },
  {
    title: 'الاسم',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'جدول العمل',
    dataIndex: 'resource_calendar_id',
    key: 'resource_calendar_id',
    render: (value) => (Array.isArray(value) ? value[1] : '—'),
  },
  {
    title: 'القسم',
    dataIndex: 'department_id',
    key: 'department_id',
    render: (val) => {
      if (!val || !Array.isArray(val)) return <Tag>لا يوجد قسم</Tag>;
      const deptName = val[1];
      return <Tag color={getColorForDepartment(deptName)}>{deptName}</Tag>;
    },
  },
  {
    title: 'الإجراء',
    key: 'action',
    render: (_, record) => (
      <Button type="link" onClick={() => showDetails(record)}>
        تفاصيل أكثر
      </Button>
    ),
  },
];

  

  const navigate = useNavigate();

  useEffect(() => {
  // console.log("1")
  const rawSession = localStorage.getItem('sessionData');
  const ses = rawSession ? JSON.parse(rawSession) : null;

  if (!ses || !ses.token) {
    navigate('/');
    return;
  }

  //  Run salary fetch only once
  if (!hasFetchedSalary.current) {
    getSalaryForEmployee(ses.uid, ses.password);
    hasFetchedSalary.current = true;
  }

  setSession(ses);

  if (
    employeeContracts &&
    currentPage &&
    dayStartTime &&
    dayEndTime &&
    nightStartTime &&
    nightEndTime
  ) {
    fetchEmployees(ses.token, ses.uid, ses.password, currentPage, pageSize);
  }
}, [
  navigate,
  employeeContracts,
  currentPage,
  dayStartTime,
  dayEndTime,
  nightStartTime,
  nightEndTime
]);




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
    // console.log("vvvvvvvvvvvvvvvvvvvvvvvvvv")
    // console.log(values)
    setLoading(true);
    
    setDayStartTime(values.day_start_time);
    setDayEndTime(values.day_end_time);
    setNightStartTime(values.night_start_time);
    setNightEndTime(values.night_end_time);
    setCalendarsIds(values.calendars_ids);
    

    setFilters(values);
    
  };


  useEffect(() => {
    // console.log("2")
    setCurrentPage(1);
    fetchEmployees( session.token, session.uid, session.password, 1, pageSize);
    // console.log(filters)
  }, [filters])




const getEmployeeStaticInfo = async (token, employee, calendars) =>  {
  const calendarName = employee?.resource_calendar_id?.[1] || "";
     // --- Attach transactions (cache-first)
  const monthName = getCurrentCustomMonth(new Date().getFullYear())?.name || "Unknown";


  let param = {};
  // Decide shift range
  if (calendarName.includes("صباحا")) {
    param.start_time = dayStartTime.split(" ")[0];
    param.end_time = dayEndTime.split(" ")[0];
 
  } else if (calendarName.includes("مساءا")) {
    param.start_time = nightStartTime.split(" ")[0];
    param.end_time = nightEndTime.split(" ")[0];
    param.night_shift = true
  } else {
    // fallback to day shift
    param.start_time = dayStartTime.split(" ")[0];
    param.end_time = dayEndTime.split(" ")[0];
    param.night_shift = false
  }

  param.page_size = 1000;
  param.emp_code = employee?.registration_number;





  // 1. Try cache
  const cached = getCachedTransactions(param.emp_code, monthName);
  if (cached) {
    employee.transactions = cached;
  } else {
    // 2. Fetch if not cached
    try {
      const txResponse = await axios.get(`/iclock/api/transactions/`, {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
        params: {
          emp_code: param.emp_code,
          page_size: "1000",
          start_time: filters.day_start_time || filters.night_start_time, // adjust as needed
          end_time: filters.day_end_time || filters.night_end_time,       // adjust as needed
        },
      });

      const txList = txResponse.data.data || [];
      employee.transactions = txList;

      // 3. Save to cache
      saveTransactionsToCache(param.emp_code, monthName, txList);
    } catch (err) {
      console.error(`Failed to fetch transactions for ${param.emp_code}`, err);
      employee.transactions = [];
    }
  }


  var statistics = null
  // If transactions already attached, compute stats
  if (employee.transactions) {
    
    if(param.night_shift){
      statistics = trackAttendanceNightShift(  employee.transactions,
          param.start_time,
          param.end_time,
          15,
          calendars,
          employee
      )
    }else{
      statistics= trackAttendanceDayShift(
        employee.transactions,
        param.start_time,
        param.end_time,
        15,
        calendars,
        employee)
    }

    employee.statistics = statistics
  
    
  }


  return param;
}

function getEmployeeShiftRanges(employee, dayStartTime, dayEndTime, nightStartTime, nightEndTime) {
  const calendarName = employee?.resource_calendar_id?.[1] || "";

  let param = {};

  // Decide shift range
  if (calendarName.includes("صباحا")) {
    param.start_time = dayStartTime;
    param.end_time = dayEndTime;
    param.workStart = "09:00:00";
    param.workEnd = "18:00:00";
  } else if (calendarName.includes("مساءا")) {
    param.start_time = nightStartTime;
    param.end_time = nightEndTime;
    param.workStart = "21:00:00";
    param.workEnd = "06:00:00";
  } else {
    // fallback to day shift
    param.start_time = dayStartTime;
    param.end_time = dayEndTime;
    param.workStart = "09:00:00";
    param.workEnd = "18:00:00";
  }

  param.page_size = 1000;
  param.emp_code = employee?.registration_number;


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


const getSalaryForEmployee = async (uid, password) => {
  const response = await axios.post("/jsonrpc", {
  "jsonrpc": "2.0",
  "method": "call",
  "params": {
    "service": "object",
    "method": "execute_kw",
    "args": [
      "odoo",
      uid,
      password,
      "hr.contract",
      "search_read",
      [[   ]],  // Replace with contract ID from previous step
      {
        "fields": ["wage", "employee_id", "date_start", "date_end", "resource_calendar_id"],
        "offset": 0,
        "limit": 10000
          
      }
    ]
  },
  "id": 1
});
  const res = response.data.result || []
  setEmployeeContracts(res)
  
};




const fetchEmployees = async (token, uid, password, page = 1, pageSize = 50) => {
  setLoading(true);
  try {
    const offset = (page - 1) * pageSize;

    // Build domain dynamically
    const domain = [];
    if (filters.name) {
      domain.push(["name", "ilike", filters.name]);
    }
    if (filters.registration_number) {
      domain.push(["registration_number", "=", filters.registration_number]);
    }
    if (filters.department_id) {
      domain.push(["department_id", "=", filters.department_id]);
    }

    if (filters.calendars_ids) {
      domain.push(["resource_calendar_id", "in", filters.calendars_ids]);
    }
    if(department){
       domain.push(["department_id", "=", department.id]);
    }
    domain.push(["registration_number", "!=", false]);

    // --- Fetch employees from Odoo
    const response = await axios.post("/jsonrpc", {
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
          "search_read",
          [domain],
          {
            fields: ["name", "registration_number", "resource_calendar_id", "department_id"],
            offset,
            limit: pageSize,
          },
        ],
      },
      id: 1,
    });

    const employees = response.data.result || [];
    const calenders = await makeTheCalendarInfo()
    
 
    for (const emp of employees) {
      emp.salary = 0
      const employeeCalendar = Object.values(calenders).find(
        c => c.id === emp.resource_calendar_id[0]
      ) ;
      const contract =  employeeContracts.find(
          c => Array.isArray(c.employee_id) && c.employee_id[0] === emp.id
        );
      
      if (contract && employeeCalendar){
       emp.salary = contract?.wage ?? 0;
       getEmployeeStaticInfo(token, emp,calenders)
      }
      
    }

    setEmployees(employees);

    // --- Fetch total count
    const countRes = await axios.post("/jsonrpc", {
      jsonrpc: "2.0",
      method: "call",
      params: {
        service: "object",
        method: "execute_kw",
        args: ["odoo", uid, password, "hr.employee", "search_count", [domain]],
      },
      id: 2,
    });

    setTotal(countRes.data.result);
  } catch (err) {
    console.error("Odoo fetch failed:", err);
  } finally {
    setLoading(false);
  }

  return employees;
};



const fetchEmployeesAll = async (token, uid, password, page = 1, pageSize = 100) => {
  var emplys = []
  try {
   const offset = (page - 1) * pageSize;

  //  console.log(offset)

    // Build domain dynamically
    const domain = [];

    if(department){
       domain.push(["department_id", "=", department.id]);
    }


    domain.push(["registration_number", "!=", false]);

    // --- Fetch employees from Odoo
    const response = await axios.post("/jsonrpc", {
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
          "search_read",
          [domain],
          {
            fields: ["name", "registration_number", "resource_calendar_id", "department_id"],
            offset: 1,
            limit: 9999,
          },
        ],
      },
      id: 1,
    });

    emplys = response.data.result || [];

    console.log(emplys)
    const calenders = await makeTheCalendarInfo()
    var count = 0
    for (const emp of emplys) {
      emp.salary = 0
      const employeeCalendar = Object.values(calenders).find(
        c => c.id === emp.resource_calendar_id[0]
      ) ;
      const contract =  employeeContracts.find(
          c => Array.isArray(c.employee_id) && c.employee_id[0] === emp.id
        );
      if (contract && employeeCalendar){
       console.log("working")
       emp.salary = contract?.wage ?? 0;
       getEmployeeStaticInfo(token, emp,calenders)
       console.log(emp)
      }else{
        console.log("not working")
        emp.statistics = null
      }
      
    }
    console.log("xxcxcx")
    console.log(count)
  } catch (err) {
    console.error("Odoo fetch failed:", err);
  } finally {
    setLoading(false);
  }

  return emplys;
};






const onCalculateAll = async () => {
 
  const allEmployees = await fetchEmployeesAll(session.token,session.uid, session.password);

  console.log(allEmployees)


  // Build combined rows with info + stats
  const rows = allEmployees.map((emp, index) => {
    const rowIndex = index + 2; // Excel row (row 1 is header)

    return {
        المعرف: emp.id,
        الاسم: emp.name,
        الرقم_الوظيفي: emp.registration_number,
        القسم: Array.isArray(emp.department_id) ? emp.department_id[1] : "",
        جدول_العمل: Array.isArray(emp.resource_calendar_id) ? emp.resource_calendar_id[1] : "",
        الراتب: emp.salary ?? 0,
        إجمالي_الأيام: emp.statistics?.totalDays ?? 0,
        الأيام_الكاملة: emp.statistics?.fullDays ?? 0,
        ايام_نسيان_بصمة_الدخول_والخروج: emp.statistics?.partialDays ?? 0,
        أيام_الغياب: emp.statistics?.absentDays ?? 0,
        الأيام_القادمة: emp.statistics?.upcomingDays ?? 0,
        دقائق_التأخير: emp.statistics?.totals?.minutesLateOnArrival ?? 0,
        دقائق_الوصول_المبكر: emp.statistics?.totals?.minutesEarlyArrival ?? 0,
        دقائق_المغادرة_المبكرة: emp.statistics?.totals?.minutesLeftEarly ?? 0,
        دقائق_العمل_الإضافي: emp.statistics?.totals?.minutesOverworked ?? 0,
        بصمات_الدخول_المفقودة: emp.statistics?.totals?.missingInPunches ?? 0,
        بصمات_الخروج_المفقودة: emp.statistics?.totals?.missingOutPunches ?? 0,
        عدد_مرات_التأخير: emp.statistics?.totals?.arrivedLateCount ?? 0,
        عدد_مرات_المغادرة_المبكرة: emp.statistics?.totals?.leftEarlyCount ?? 0,
        عدد_مرات_العمل_الإضافي: emp.statistics?.totals?.overworkedCount ?? 0,
        السلف: emp.statistics?.borrow ?? 0,

        // الصيغ الحسابية: الإشارة إلى الأعمدة حسب الحرف
        خصم_التأخير: { f: `((F${rowIndex}/30)/120)*L${rowIndex}` }, 
        // الراتب في F، دقائق التأخير في L

        خصم_الغياب: { f: `(F${rowIndex}/30)*(J${rowIndex}+INT((P${rowIndex}+Q${rowIndex})/2))` },
        // الراتب في F، أيام الغياب في K، بصمات الدخول في N، بصمات الخروج في O

        صافي_الراتب: { f: `F${rowIndex}-V${rowIndex}-W${rowIndex}-U${rowIndex}` }
        // الراتب في F، خصم التأخير في S، خصم الغياب في T، السلف في Q
      };

  });

  // Convert to worksheet
  const ws = XLSX.utils.json_to_sheet(rows, { skipHeader: false });

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Employees+Stats");

  // Export
  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  saveAs(new Blob([wbout], { type: "application/octet-stream" }), "Employees_Salaries.xlsx");
};







   




  return (
  <>
     <EmployeeFilter department={department} onSearch={handleSearch} session={session} onCalculateAll={onCalculateAll} />
    
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
            fetchEmployees(session.token , session.uid, session.password, page, pageSize);
          },
          onShowSizeChange: (current, size) => {
            setPageSize(size);
            fetchEmployees(session.token, session.uid, session.password, current, size);
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