import { Drawer, Tag, Table, Button } from "antd";
import React, { useState, useRef } from 'react';

import "./EmployeeDrawer.scss";
import { useReactToPrint } from "react-to-print";


const EmployeeDrawer = ({ open, onClose, employee, transactions = [] }) => {
  const transactionColumns = [
    { title: "Employee Code", dataIndex: "emp_code", key: "emp_code" },
    { title: "Punch Time", dataIndex: "punch_time", key: "punch_time" },
    { title: "Punch State", dataIndex: "punch_state_display", key: "punch_state_display" },
    { title: "Verify Type", dataIndex: "verify_type_display", key: "verify_type_display" },
    { title: "Area", dataIndex: "area_alias", key: "area_alias" },
    { title: "Terminal", dataIndex: "terminal_alias", key: "terminal_alias" },
  ];

// Create a ref for the content you want to print
  const componentRef = useRef(null);

  // Hook with new API: pass contentRef
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Employee_${employee?.name || "Details"}`
  });

  return (
    <Drawer
      title="Employee Details"
      placement="right"
      width={800}
      onClose={onClose}
      open={open}
      extra={
        <Button onClick={handlePrint} type="primary">
          Print
        </Button>
      }
    >
      {employee ? (
        <div className="employee-drawer" ref={componentRef}>
          <p><strong>ID:</strong> {employee.id}</p>
          <p><strong>Name:</strong> {employee.name}</p>
          <p><strong>Registration Number:</strong> {employee.registration_number || "—"}</p>
          <p>
            <strong>Department:</strong>{" "}
            {Array.isArray(employee.department_id) ? (
              <Tag color="blue">{employee.department_id[1]}</Tag>
            ) : (
              <Tag>No Department</Tag>
            )}
          </p>
          <p>
            <strong>Work Schedule:</strong>{" "}
            {Array.isArray(employee.resource_calendar_id)
              ? employee.resource_calendar_id[1]
              : "—"}
          </p>

          {/* Statistics Section */}
         {employee.statistics && (
          <div className="statistics">
            <h3>Statistics</h3>

            {/* Day counts */}
            <p><strong>Total Days:</strong> {employee.statistics.totalDays}</p>
            <p><strong>Full Days:</strong> {employee.statistics.fullDays}</p>
            <p><strong>Partial Days:</strong> {employee.statistics.partialDays}</p>
            <p><strong>Absent Days:</strong> {employee.statistics.absentDays}</p>
            <p><strong>Upcoming Days:</strong> {employee.statistics.upcomingDays}</p>
            {/* If you also track holidays, you can add: */}
            {/* <p><strong>Holiday Days:</strong> {employee.statistics.holidayDays}</p> */}

            {/* Minute-based totals */}
            <p><strong>Minutes Late on Arrival:</strong> {employee.statistics.totals.minutesLateOnArrival}</p>
            <p><strong>Minutes Early Arrival:</strong> {employee.statistics.totals.minutesEarlyArrival}</p>
            <p><strong>Minutes Left Early:</strong> {employee.statistics.totals.minutesLeftEarly}</p>
            <p><strong>Minutes Overworked:</strong> {employee.statistics.totals.minutesOverworked}</p>

            {/* Punch issues */}
            <p><strong>Missing IN Punches:</strong> {employee.statistics.totals.missingInPunches}</p>
            <p><strong>Missing OUT Punches:</strong> {employee.statistics.totals.missingOutPunches}</p>

            {/* Event counts */}
            <p><strong>Late Arrivals Count:</strong> {employee.statistics.totals.arrivedLateCount}</p>
            <p><strong>Left Early Count:</strong> {employee.statistics.totals.leftEarlyCount}</p>
            <p><strong>Overworked Count:</strong> {employee.statistics.totals.overworkedCount}</p>

            {/* Salary deductions */}
            <p><strong>Deduction (Late):</strong> {employee.statistics.deductionLate}</p>
            <p><strong>Deduction (Absent):</strong> {employee.statistics.deductionAbsent}</p>
            <p><strong>Borrow:</strong> {employee.statistics.borrow}</p>
            <p><strong>Net Salary:</strong> {employee.statistics.netSalary}</p>
          </div>

        )}


          {/* Transactions Table */}
          <h3>Transactions</h3>
          <div className="transactions-table">
            <Table
              columns={transactionColumns}
              dataSource={transactions}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </div>
        </div>
      ) : (
        <p>No employee selected</p>
      )}
    </Drawer>
  );
};

export default EmployeeDrawer;
