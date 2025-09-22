import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  DesktopOutlined,
  FileOutlined,
  PieChartOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { trackAttendanceNightShift, trackAttendanceDayShift } from '../../utils/attendance';
import { Breadcrumb, Layout, Menu, theme } from 'antd';
import EmployeeTable from '../EmployeeTable';
import { fetchDepartments, buildDepartmentMenu } from '../../utils/departments'
const { Header, Content, Footer, Sider } = Layout;
function getItem(label, key, icon, children) {
  return {
    key,
    icon,
    children,
    label,
  };
}



const BASE_URL = "http://q.softo.live:85";
const API_ENDPOINT = "/iclock/api/transactions/";
const AUTH_ENDPOINT = "/api-token-auth/";
const USERNAME = "admin";
const PASSWORD = "Admin1234";
const items = [
  getItem('Option 1', '1', <PieChartOutlined />),
  getItem('Option 2', '2', <DesktopOutlined />),
  getItem('User', 'sub1', <UserOutlined />, [
    getItem('Tom', '3'),
    getItem('Bill', '4'),
    getItem('Alex', '5'),
  ]),
  getItem('Team', 'sub2', <TeamOutlined />, [getItem('Team 1', '6'), getItem('Team 2', '8')]),
  getItem('Files', '9', <FileOutlined />),
];
const MainPage = ({department}) => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const [token, setToken] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState(null);


  const navigate = useNavigate();


  function getItem(label, key, icon, children) {
  return { key, icon, children, label };
}

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
        console.log("yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy")
        console.log(department)
    const loadDepartments = async () => {
        const departments = await fetchDepartments();
        const departmentMenu = buildDepartmentMenu(departments);
        console.log("*********************************")
        console.log(departments)
        console.log(departmentMenu)
        setMenuItems(departmentMenu);
    };

    loadDepartments();
    }, []);


  useEffect(() => {

  


    const rawSession = localStorage.getItem("sessionData");
    const session = rawSession ? JSON.parse(rawSession) : null;

    if (!session || !session.token) {
      navigate("/");
      return;
    }

  

  

  }, []);



















const handleMenuClick = (info) => {
  if (!info || !info.key) {
    console.warn("Menu click received invalid info:", info);
    return;
  }

  const { key } = info;
//   console.log("Clicked menu item:", key);

  if (key.startsWith("dept-")) {
    const deptName = key.replace("dept-", "");
    navigate(`/department/${deptName}`);
  }
};
;









  








  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={value => setCollapsed(value)}>
        <div className="demo-logo-vertical" />
        <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline" items={menuItems}  onClick={(info) => {handleMenuClick(info)}}/>
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }} />
        <Content style={{ margin: '0 16px' }}>
          <Breadcrumb style={{ margin: '16px 0' }} items={[{ title: 'User' }, { title: 'Bill' }]} />
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
          <EmployeeTable department={department} />
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          Ant Design ©{new Date().getFullYear()} Created by Quu/Gladdema
        </Footer>
      </Layout>
    </Layout>
  );
};
export default MainPage;