import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { makeTheCalendarInfo } from "../../utils/calendar";
import { trackAttendanceNightShift, trackAttendanceDayShift } from '../../utils/attendance';
import { Breadcrumb, Layout, Menu, theme } from 'antd';
import EmployeeTable from '../EmployeeTable';
import { fetchDepartments, buildDepartmentMenu } from '../../utils/departments'
import {
  DesktopOutlined,
  FileOutlined,
  PieChartOutlined,
  TeamOutlined,
  UserOutlined,
  ApartmentOutlined,
  DollarOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import LoanPage from '../LoanPage';
import HolidayPage from '../HolidayPage';

const staticMenuItems = [
  getItem('لوحة التحكم', 'dashboard', <PieChartOutlined />, <HolidayPage />, false, null),
  getItem('طلبات السلف', 'loan', <DollarOutlined />, <LoanPage />, false, null),
  getItem('طلبات الإجازة', 'holiday', <CalendarOutlined />, <HolidayPage />, false, null),
];


const componentMap = {
    dashboard: () => <HolidayPage />,
    loan: () => <LoanPage />,
    holiday: () => <HolidayPage />,
    department: (key, dept) => <EmployeeTable key={key} department={dept} />
};




const { Header, Content, Footer, Sider } = Layout;


function getItem(label, key, icon, component = null, isParent = false, children = null) {
  return {
    key,
    icon,
    label,
    component,
    isParent,
    children
  };
}


 

const MainPage = () => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const [token, setToken] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState(null);
  const [activeComponent, setActiveComponent] = useState(null);
  const [depts, setDepts] = useState([])



  const navigate = useNavigate();

    // const staticItems = [
    // getItem('Option 1', '1', <PieChartOutlined />),
    // getItem('Option 2', '2', <DesktopOutlined />),
    // getItem('User', 'sub1', <UserOutlined />, [
    //     getItem('Tom', '3'),
    //     getItem('Bill', '4'),
    //     getItem('Alex', '5'),
    // ]),
    // getItem('Team', 'sub2', <TeamOutlined />, [
    //     getItem('Team 1', '6'),
    //     getItem('Team 2', '8')
    // ]),
    // getItem('Files', '9', <FileOutlined />),
    // ];

    const [menuItems, setMenuItems] = useState([]);

    useEffect(() => {

     const rawSession = localStorage.getItem("sessionData");
    const session = rawSession ? JSON.parse(rawSession) : null;

    if (!session || !session.token) {
      navigate("/");
      return;
    }

    const loadDepartments = async () => {
    const departments = await fetchDepartments();
    const departmentMenu = buildDepartmentMenu(departments); // returns an array

    setMenuItems([...staticMenuItems, ...departmentMenu]);
    setDepts(departments)
    };

   
    loadDepartments();

    
    
    
    }, []);


  



















const handleMenuClick = (info) => {
  if (!info || !info.key) return;

  const { key } = info;

  if (key.startsWith("dept-")) {
    const deptId = key.replace("dept-", "");
    const selectedDept = depts.find(d => String(d.id) === deptId);
    setActiveComponent(() => componentMap.department(deptId, selectedDept));
  } else if (componentMap[key]) {
    setActiveComponent(() => componentMap[key]());
  }
};











  








  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={value => setCollapsed(value)}>
        <div className="demo-logo-vertical" />
        <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline" items={menuItems}  onClick={(info) => {handleMenuClick(info)}}/>
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }} />
        <Content style={{ margin: '0 16px' }}>
          {/* <Breadcrumb style={{ margin: '16px 0' }} items={[{ title: 'User' }, { title: 'Bill' }]} /> */}
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
          {activeComponent ? activeComponent : <p>Please select a menu item.</p>}
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          Quu ©{new Date().getFullYear()} Created by Quu/Gladdema
        </Footer>
      </Layout>
    </Layout>
  );
};
export default MainPage;