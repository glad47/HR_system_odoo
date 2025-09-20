// EmployeeFilter.jsx
import { Form, Input, Button, Row, Col, Select } from "antd";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  getAllCustomMonths,
  getCurrentCustomMonth,
  getAllCustomMonthsNight,
  getCurrentCustomMonthNight,
} from "../../utils/dateRanges";


const EmployeeFilter = ({ onSearch, session }) => {
  const [form] = Form.useForm();
  const [departments, setDepartments] = useState([]);
  const [months, setMonths] = useState([]);
  const [nightMonths, setNightMonths] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(null);
  const [currentNightMonth, setCurrentNightMonth] = useState(null);
  const [ready, setReady] = useState(false);

  
  // --- Load months and defaults ---
  useEffect(() => {
    const year = new Date().getFullYear();
    const allMonths = getAllCustomMonths(year);
    const allNight = getAllCustomMonthsNight(year);
    const current = getCurrentCustomMonth(year);
    const currentNight = getCurrentCustomMonthNight(year);

    setMonths(allMonths);
    setNightMonths(allNight);
    setCurrentMonth(current);
    setCurrentNightMonth(currentNight);
    setReady(true);


    if (current && currentNight) {
    onSearch({
      dayMonth: current.name,
      day_start_time: current.start,
      day_end_time: current.end,
      nightMonth: currentNight.name,
      night_start_time: currentNight.start,
      night_end_time: currentNight.end,
    });
  }
  }, []);

  // --- Load departments ---
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axios.post("/jsonrpc", {
          jsonrpc: "2.0",
          method: "call",
          params: {
            service: "object",
            method: "execute_kw",
            args: [
              "odoo",
              session.uid,
              session.password,
              "hr.department",
              "search_read",
              [[]],
              { fields: ["name"] },
            ],
          },
          id: 1,
        });
        setDepartments(response.data.result || []);
      } catch (err) {
        console.error("Failed to load departments:", err);
      }
    };
    if (session?.uid && session?.password) {
      fetchDepartments();
    }
  }, [session]);

    const handleFinish = (values) => {
    // clone values
    const filters = { ...values };

    // find the selected day month range
    if (values.dayMonth) {
        const selectedDay = months.find(m => m.name === values.dayMonth);
        if (selectedDay) {
        filters.day_start_time = selectedDay.start;
        filters.day_end_time = selectedDay.end;
        }
    }

    // find the selected night month range
    if (values.nightMonth) {
        const selectedNight = nightMonths.find(m => m.name === values.nightMonth);
        if (selectedNight) {
        filters.night_start_time = selectedNight.start;
        filters.night_end_time = selectedNight.end;
        }
    }
    onSearch(filters);
    };

  const handleReset = () => {
    form.resetFields(); // resets back to initialValues
    onSearch({});
  };

  if (!ready) return null; // wait until defaults are ready

  return (
    <Form
      form={form}
      layout="inline"
      initialValues={{
        dayMonth: currentMonth?.name,
        nightMonth: currentNightMonth?.name,
      }}
      onFinish={handleFinish}
      style={{ marginBottom: 16 }}
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8} lg={8}>
          <Form.Item name="name" label="Name">
            <Input placeholder="Search by name" allowClear />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12} md={8} lg={8}>
          <Form.Item name="registration_number" label="ID">
            <Input placeholder="Search by registration number" allowClear />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12} md={8} lg={8}>
          <Form.Item name="department_id" label="Department">
            <Select placeholder="Select department" allowClear>
              {departments.map((dept) => (
                <Select.Option key={dept.id} value={dept.id}>
                  {dept.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

        <Col xs={24} sm={12} md={12} lg={12}>
          <Form.Item name="dayMonth" label="Month">
            <Select placeholder="Select month">
              {months.map((m) => (
                <Select.Option key={m.name} value={m.name}>
                  {m.name} ({m.start} → {m.end})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

        <Col xs={24} sm={12} md={12} lg={12}>
          <Form.Item name="nightMonth" label="Month (Night Shift)">
            <Select placeholder="Select month">
              {nightMonths.map((m) => (
                <Select.Option key={m.name} value={m.name}>
                  {m.name} ({m.start} → {m.end})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

        <Col xs={24}>
          <Row justify="end">
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Search
              </Button>
              <Button style={{ marginLeft: 8 }} onClick={handleReset}>
                Reset
              </Button>
            </Form.Item>
          </Row>
        </Col>
      </Row>
    </Form>
  );
};

export default EmployeeFilter;
