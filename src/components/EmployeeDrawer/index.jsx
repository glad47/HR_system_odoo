import { Drawer, Tag, Table, Button } from "antd";
import React, { useState, useRef } from 'react';

import "./EmployeeDrawer.scss";
import { useReactToPrint } from "react-to-print";


const EmployeeDrawer = ({ open, onClose, employee, transactions = [] }) => {


// Create a ref for the content you want to print
  const componentRef = useRef(null);

  // Hook with new API: pass contentRef
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Employee_${employee?.name || "Details"}`
  });

  return (
   <Drawer
  title="تفاصيل الموظف"
  placement="right"
  width={800}
  onClose={onClose}
  open={open}
  extra={
    <Button onClick={handlePrint} type="primary">
      طباعة
    </Button>
  }
>
  {employee ? (
    <div className="employee-drawer" ref={componentRef}>
      <p><strong>المعرف:</strong> {employee.id}</p>
      <p><strong>الاسم:</strong> {employee.name}</p>
      <p><strong>رقم التسجيل:</strong> {employee.registration_number || "—"}</p>
      <p>
        <strong>القسم:</strong>{" "}
        {Array.isArray(employee.department_id) ? (
          <Tag color="blue">{employee.department_id[1]}</Tag>
        ) : (
          <Tag>لا يوجد قسم</Tag>
        )}
      </p>
      <p>
        <strong>جدول العمل:</strong>{" "}
        {Array.isArray(employee.resource_calendar_id)
          ? employee.resource_calendar_id[1]
          : "—"}
      </p>

      {/* قسم الإحصائيات */}
      {employee.statistics && (
        <div className="statistics">
          <h3>الإحصائيات</h3>

          {/* عدد الأيام */}
          <p><strong>إجمالي الأيام:</strong> {employee.statistics.totalDays}</p>
          <p><strong>أيام كاملة:</strong> {employee.statistics.fullDays}</p>
          <p><strong>أيام جزئية:</strong> {employee.statistics.partialDays}</p>
          <p><strong>أيام الغياب:</strong> {employee.statistics.absentDays}</p>
          <p><strong>الأيام القادمة:</strong> {employee.statistics.upcomingDays}</p>

          {/* الإحصائيات الزمنية */}
          <p><strong>دقائق التأخير عند الوصول:</strong> {employee.statistics.totals.minutesLateOnArrival}</p>
          <p><strong>دقائق الوصول المبكر:</strong> {employee.statistics.totals.minutesEarlyArrival}</p>
          <p><strong>دقائق المغادرة المبكرة:</strong> {employee.statistics.totals.minutesLeftEarly}</p>
          <p><strong>دقائق العمل الإضافي:</strong> {employee.statistics.totals.minutesOverworked}</p>

          {/* مشاكل البصمة */}
          <p><strong>بصمات الدخول المفقودة:</strong> {employee.statistics.totals.missingInPunches}</p>
          <p><strong>بصمات الخروج المفقودة:</strong> {employee.statistics.totals.missingOutPunches}</p>

          {/* عدد الأحداث */}
          <p><strong>عدد مرات التأخير:</strong> {employee.statistics.totals.arrivedLateCount}</p>
          <p><strong>عدد مرات المغادرة المبكرة:</strong> {employee.statistics.totals.leftEarlyCount}</p>
          <p><strong>عدد مرات العمل الإضافي:</strong> {employee.statistics.totals.overworkedCount}</p>

          {/* الخصومات */}
          <p><strong>خصم (تأخير):</strong> {employee.statistics.deductionLate}</p>
          <p><strong>خصم (غياب):</strong> {employee.statistics.deductionAbsent}</p>
          <p><strong>السلف:</strong> {employee.statistics.borrow}</p>
          <p><strong>صافي الراتب:</strong> {employee.statistics.netSalary}</p>
        </div>
      )}

      {/* جدول الحركات */}
      <h3>الحركات</h3>
      <div className="transactions-table">
        <Table
          columns={[
            { title: "رمز الموظف", dataIndex: "emp_code", key: "emp_code" },
            { title: "وقت البصمة", dataIndex: "punch_time", key: "punch_time" },
            { title: "حالة البصمة", dataIndex: "punch_state_display", key: "punch_state_display" },
            { title: "نوع التحقق", dataIndex: "verify_type_display", key: "verify_type_display" },
            { title: "المنطقة", dataIndex: "area_alias", key: "area_alias" },
            { title: "الجهاز", dataIndex: "terminal_alias", key: "terminal_alias" },
          ]}
          dataSource={transactions}
          rowKey="id"
          pagination={false}
          size="small"
        />
      </div>
    </div>
  ) : (
    <p>لم يتم اختيار موظف</p>
  )}
</Drawer>

  );
};

export default EmployeeDrawer;
