import { Drawer, Tag, Table } from "antd";

const EmployeeDrawer = ({ open, onClose, employee, transactions = [] }) => {
  // Define table columns for transactions



const transactionColumns = [
  {
    title: "Employee Code",
    dataIndex: "emp_code",
    key: "emp_code",
  },
  {
    title: "Punch Time",
    dataIndex: "punch_time",
    key: "punch_time",
  },
  {
    title: "Punch State",
    dataIndex: "punch_state_display",
    key: "punch_state_display",
  },
  {
    title: "Verify Type",
    dataIndex: "verify_type_display",
    key: "verify_type_display",
  },
  {
    title: "Area",
    dataIndex: "area_alias",
    key: "area_alias",
  },
  {
    title: "Terminal",
    dataIndex: "terminal_alias",
    key: "terminal_alias",
  },
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
        <div>
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

          {/* Transactions Table */}
          <h3 style={{ marginTop: 24 }}>Transactions</h3>
          <Table
            columns={transactionColumns}
            dataSource={transactions}
            rowKey="id"
            pagination={false}
            size="small"
          />
        </div>
      ) : (
        <p>No employee selected</p>
      )}
    </Drawer>
  );
};

export default EmployeeDrawer;
