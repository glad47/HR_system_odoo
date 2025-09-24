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

import { groupCalendarsByShift, fetchCalendars } from "../../utils/calendar";
import { fetchDepartments } from "../../utils/departments"



const EmployeeFilter = ({ onSearch, session, onCalculateAll, department }) => {
  const [form] = Form.useForm();
  const [departments, setDepartments] = useState([]);
  const [months, setMonths] = useState([]);
  const [nightMonths, setNightMonths] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(null);
  const [currentNightMonth, setCurrentNightMonth] = useState(null);
  const [dayCalendarIds, setDayCalendarIds] = useState([]);
  const [nightCalendarIds, setNightCalendarIds] = useState([]);

  const [ready, setReady] = useState(false);

  useEffect(() => {
  
  // fetch and group the calander info 
  const fetchCalendarsOnMount = async () => {
    try{
      const calendars = await fetchCalendars();

      const { dayCalendars, nightCalendars } = groupCalendarsByShift(calendars);

      setDayCalendarIds(dayCalendars.map(c => c.id));
      setNightCalendarIds(nightCalendars.map(c => c.id));
    } catch (err) {
      console.error("Failed to load calendars:", err);
    }
  };


  fetchCalendarsOnMount();
  
}, []);

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
    const fetchDepartmentsOnLoad = async () => {
      const departments = await fetchDepartments();
       setDepartments(departments);
    };
    if (session?.uid && session?.password) {
      fetchDepartmentsOnLoad();
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

     if(values.shiftType == "day"){
        filters.calendars_ids= dayCalendarIds

    }else if(values.shiftType == "night"){
       filters.calendars_ids= nightCalendarIds
    }else{
      filters.calendars_ids = null
    }
    onSearch(filters);
    };

  const handleReset = () => {
    form.resetFields(); // resets back to initialValues
    form.setFieldsValue({
        dayMonth: currentMonth?.name,
        nightMonth: currentNightMonth?.name,
    });
    onSearch({
        dayMonth: currentMonth?.name,
        day_start_time: currentMonth?.start,
        day_end_time: currentMonth?.end,
        nightMonth: currentNightMonth?.name,
        night_start_time: currentNightMonth?.start,
        night_end_time: currentNightMonth?.end,
    });
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
      <Form.Item name="name" label="الاسم">
        <Input placeholder="البحث بالاسم" allowClear />
      </Form.Item>
    </Col>

    <Col xs={24} sm={12} md={8} lg={8}>
      <Form.Item name="registration_number" label="الرقم الوظيفي">
        <Input placeholder="البحث بالرقم الوظيفي" allowClear />
      </Form.Item>
    </Col>

    {!department ? (
      <Col xs={24} sm={12} md={8} lg={8}>
        <Form.Item name="department_id" label="القسم">
          <Select placeholder="اختر القسم" allowClear>
            {departments.map((dept) => (
              <Select.Option key={dept.id} value={dept.id}>
                {dept.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Col>
    ) : null}

    <Col xs={24} sm={12} md={8} lg={8}>
      <Form.Item name="shiftType" label="نوع الدوام">
        <Select placeholder="اختر نوع الدوام" allowClear>
          <Select.Option value="day">دوام صباحي</Select.Option>
          <Select.Option value="night">دوام ليلي</Select.Option>
        </Select>
      </Form.Item>
    </Col>

    <Col xs={24} sm={24} md={24} lg={24}>
      <Form.Item name="dayMonth" label="الشهر" style={{ width: "50%" }}>
        <Select placeholder="اختر الشهر">
          {months.map((m) => (
            <Select.Option key={m.name} value={m.name}>
              {m.name} ({m.start} → {m.end})
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
    </Col>

    <Col xs={24} sm={24} md={24} lg={24}>
      <Form.Item name="nightMonth" label="الشهر (الدوام الليلي)" style={{ width: "60%" }}>
        <Select placeholder="اختر الشهر">
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
          <Button style={{ marginRight: 8 }} type="primary" htmlType="submit">
            بحث
          </Button>
          <Button style={{ marginRight: 8 }} onClick={() => handleReset()}>
            إعادة تعيين
          </Button>
          <Button
            style={{
              marginRgiht: 8,
              backgroundColor: "#52c41a",
              borderColor: "#52c41a",
              color: "#fff",
            }}
            onClick={() => onCalculateAll()}
          >
            احتساب جميع الرواتب
          </Button>
        </Form.Item>
      </Row>
    </Col>
  </Row>
</Form>

  );
};

export default EmployeeFilter;
