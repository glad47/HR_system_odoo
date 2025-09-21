import { Drawer, Tag, Table } from "antd";
import "./EmployeeDrawer.scss";

const EmployeeDrawer = ({ open, onClose, employee, transactions = [] }) => {
  const transactionColumns = [
    { title: "Employee Code", dataIndex: "emp_code", key: "emp_code" },
    { title: "Punch Time", dataIndex: "punch_time", key: "punch_time" },
    { title: "Punch State", dataIndex: "punch_state_display", key: "punch_state_display" },
    { title: "Verify Type", dataIndex: "verify_type_display", key: "verify_type_display" },
    { title: "Area", dataIndex: "area_alias", key: "area_alias" },
    { title: "Terminal", dataIndex: "terminal_alias", key: "terminal_alias" },
  ];

  return (
    <Drawer
      title="Employee Details"
      placement="right"
      width={800}
      onClose={onClose}
      open={open}
    >
      {employee ? (
        <div className="employee-drawer">
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
              <p><strong>Total Days:</strong> {employee.statistics.totalDays}</p>
              <p><strong>Full Days:</strong> {employee.statistics.fullDays}</p>
              <p><strong>Partial Days:</strong> {employee.statistics.partialDays}</p>
              <p><strong>Absent Days:</strong> {employee.statistics.absentDays}</p>
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
