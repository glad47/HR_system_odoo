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
import { Breadcrumb, Layout, Menu, theme } from 'antd';
import EmployeeTable from '../EmployeeTable';

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
const MainPage = () => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const [token, setToken] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState(null);


  const navigate = useNavigate();

  useEffect(() => {
    const rawSession = localStorage.getItem('sessionData');
    const session = rawSession ? JSON.parse(rawSession) : null;
    
    if (!session || !session.token || !session.token) {
      navigate('/');
    }

    // fetchTransactions(token);

    const punches = [
        {
            "id": 122723,
            "emp": 772,
            "emp_code": "10136",
            "first_name": "عبدالعزيز احمد حسن محمد",
            "last_name": null,
            "department": "الادارة",
            "position": null,
            "punch_time": "2025-08-26 09:14:58",
            "punch_state": "255",
            "punch_state_display": "Unknown",
            "verify_type": 1,
            "verify_type_display": "Fingerprint",
            "work_code": "0",
            "gps_location": null,
            "area_alias": "الادارة",
            "terminal_sn": "MFP3241700893",
            "temperature": 0.0,
            "is_mask": "No",
            "terminal_alias": "الادارة",
            "upload_time": "2025-08-26 08:40:59"
        },
        {
            "id": 122852,
            "emp": 772,
            "emp_code": "10136",
            "first_name": "عبدالعزيز احمد حسن محمد",
            "last_name": null,
            "department": "الادارة",
            "position": null,
            "punch_time": "2025-08-26 17:44:30",
            "punch_state": "255",
            "punch_state_display": "Unknown",
            "verify_type": 1,
            "verify_type_display": "Fingerprint",
            "work_code": "0",
            "gps_location": null,
            "area_alias": "الادارة",
            "terminal_sn": "MFP3241700893",
            "temperature": 0.0,
            "is_mask": "No",
            "terminal_alias": "الادارة",
            "upload_time": "2025-08-26 18:09:34"
        },
        {
            "id": 123382,
            "emp": 772,
            "emp_code": "10136",
            "first_name": "عبدالعزيز احمد حسن محمد",
            "last_name": null,
            "department": "الادارة",
            "position": null,
            "punch_time": "2025-08-27 08:53:11",
            "punch_state": "255",
            "punch_state_display": "Unknown",
            "verify_type": 1,
            "verify_type_display": "Fingerprint",
            "work_code": "0",
            "gps_location": null,
            "area_alias": "الادارة",
            "terminal_sn": "MFP3241700893",
            "temperature": 0.0,
            "is_mask": "No",
            "terminal_alias": "الادارة",
            "upload_time": "2025-08-27 08:53:12"
        },
        {
            "id": 123472,
            "emp": 772,
            "emp_code": "10136",
            "first_name": "عبدالعزيز احمد حسن محمد",
            "last_name": null,
            "department": "الادارة",
            "position": null,
            "punch_time": "2025-08-27 18:02:50",
            "punch_state": "255",
            "punch_state_display": "Unknown",
            "verify_type": 1,
            "verify_type_display": "Fingerprint",
            "work_code": "0",
            "gps_location": null,
            "area_alias": "الادارة",
            "terminal_sn": "MFP3241700893",
            "temperature": 0.0,
            "is_mask": "No",
            "terminal_alias": "الادارة",
            "upload_time": "2025-08-27 18:02:50"
        },
        {
            "id": 124039,
            "emp": 772,
            "emp_code": "10136",
            "first_name": "عبدالعزيز احمد حسن محمد",
            "last_name": null,
            "department": "الادارة",
            "position": null,
            "punch_time": "2025-08-28 08:45:00",
            "punch_state": "255",
            "punch_state_display": "Unknown",
            "verify_type": 1,
            "verify_type_display": "Fingerprint",
            "work_code": "0",
            "gps_location": null,
            "area_alias": "الادارة",
            "terminal_sn": "MFP3241700893",
            "temperature": 0.0,
            "is_mask": "No",
            "terminal_alias": "الادارة",
            "upload_time": "2025-08-28 08:45:01"
        },
        {
            "id": 124185,
            "emp": 772,
            "emp_code": "10136",
            "first_name": "عبدالعزيز احمد حسن محمد",
            "last_name": null,
            "department": "الادارة",
            "position": null,
            "punch_time": "2025-08-28 18:30:19",
            "punch_state": "255",
            "punch_state_display": "Unknown",
            "verify_type": 1,
            "verify_type_display": "Fingerprint",
            "work_code": "0",
            "gps_location": null,
            "area_alias": "الادارة",
            "terminal_sn": "MFP3241700893",
            "temperature": 0.0,
            "is_mask": "No",
            "terminal_alias": "الادارة",
            "upload_time": "2025-08-28 18:30:20"
        },
        {
            "id": 125244,
            "emp": 772,
            "emp_code": "10136",
            "first_name": "عبدالعزيز احمد حسن محمد",
            "last_name": null,
            "department": "الادارة",
            "position": null,
            "punch_time": "2025-08-30 08:40:02",
            "punch_state": "255",
            "punch_state_display": "Unknown",
            "verify_type": 1,
            "verify_type_display": "Fingerprint",
            "work_code": "0",
            "gps_location": null,
            "area_alias": "الادارة",
            "terminal_sn": "MFP3241700893",
            "temperature": 0.0,
            "is_mask": "No",
            "terminal_alias": "الادارة",
            "upload_time": "2025-08-30 08:40:03"
        },
        {
            "id": 125342,
            "emp": 772,
            "emp_code": "10136",
            "first_name": "عبدالعزيز احمد حسن محمد",
            "last_name": null,
            "department": "الادارة",
            "position": null,
            "punch_time": "2025-08-30 18:01:14",
            "punch_state": "255",
            "punch_state_display": "Unknown",
            "verify_type": 1,
            "verify_type_display": "Fingerprint",
            "work_code": "0",
            "gps_location": null,
            "area_alias": "الادارة",
            "terminal_sn": "MFP3241700893",
            "temperature": 0.0,
            "is_mask": "No",
            "terminal_alias": "الادارة",
            "upload_time": "2025-08-30 18:01:14"
        },
        {
            "id": 125857,
            "emp": 772,
            "emp_code": "10136",
            "first_name": "عبدالعزيز احمد حسن محمد",
            "last_name": null,
            "department": "الادارة",
            "position": null,
            "punch_time": "2025-08-31 08:43:32",
            "punch_state": "255",
            "punch_state_display": "Unknown",
            "verify_type": 1,
            "verify_type_display": "Fingerprint",
            "work_code": "0",
            "gps_location": null,
            "area_alias": "الادارة",
            "terminal_sn": "MFP3241700893",
            "temperature": 0.0,
            "is_mask": "No",
            "terminal_alias": "الادارة",
            "upload_time": "2025-08-31 08:43:32"
        },
        {
            "id": 125970,
            "emp": 772,
            "emp_code": "10136",
            "first_name": "عبدالعزيز احمد حسن محمد",
            "last_name": null,
            "department": "الادارة",
            "position": null,
            "punch_time": "2025-08-31 18:11:46",
            "punch_state": "255",
            "punch_state_display": "Unknown",
            "verify_type": 1,
            "verify_type_display": "Fingerprint",
            "work_code": "0",
            "gps_location": null,
            "area_alias": "الادارة",
            "terminal_sn": "MFP3241700893",
            "temperature": 0.0,
            "is_mask": "No",
            "terminal_alias": "الادارة",
            "upload_time": "2025-08-31 18:11:46"
        }
    ]

    // const res = trackAttendance(punches,"2025-08-26 00:00:00","2025-09-25 23:59:59", '09:00:00','18:00:00', 15 )
  }, [navigate]);


  

  








  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={value => setCollapsed(value)}>
        <div className="demo-logo-vertical" />
        <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline" items={items} />
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
          <EmployeeTable />
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