import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Checkbox, Typography, Card, message  } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import TransactionPreloader from '../TransactionPreloader';




import './Login.scss';

const { Title } = Typography;

function Login() {
  const navigate = useNavigate();
  const [showPreloader, setShowPreloader] = useState(false);
  const [sessionData, setSessionData] = useState(null);


    // useEffect(() => {
    //     localStorage.removeItem('sessionData');
    // }, [])



    const [messageApi, contextHolder] = message.useMessage();
    const AUTH_ENDPOINT = "/api-token-auth/";
    const ODOO_ENDPOINT = "/jsonrpc";
    const BIOTIME_USERNAME = "admin";
    const BIOTIME_PASSWORD = "Admin1234";

    const onFinish = async (values) => {
        const { username, password, remember } = values;
        try {
            // Step 1: Biotime auth
            const biotimeRes = await axios.post(AUTH_ENDPOINT, {
            username: BIOTIME_USERNAME,
            password: BIOTIME_PASSWORD,
            }, { headers: { 'Content-Type': 'application/json' } });

            const biotimeToken = biotimeRes.data.token;

            // Step 2: Odoo auth
            const odooRes = await axios.post(ODOO_ENDPOINT, {
            jsonrpc: "2.0",
            method: "call",
            params: {
                service: "common",
                method: "authenticate",
                args: ["odoo", username.trim(), password.trim(), {}],
            },
            id: 1,
            }, { headers: { 'Content-Type': 'application/json' } });

            const odooUid = odooRes.data.result;

            if (!odooUid || !biotimeToken) {
            messageApi.error('فشل تسجيل الدخول. تحقق من بياناتك وحاول مرة أخرى.');
            return;
            }

            const session = { uid: odooUid, password: password.trim(), token: biotimeToken };

            if (remember) {
            localStorage.setItem('sessionData', JSON.stringify(session));
            } else {
            sessionStorage.setItem('sessionData', JSON.stringify(session));
            }

            setSessionData(session);
            setShowPreloader(true); // 👈 show preloader instead of navigating immediately

        } catch (err) {
            messageApi.error('فشل الاتصال بالخادم. يرجى المحاولة لاحقًا.');
            console.error("Login error:", err);
        }
        }



  return (
  <>
    {showPreloader && sessionData && (
      <TransactionPreloader
        token={sessionData.token}
        onDone={() => {
          setShowPreloader(false);
          navigate('/main'); // 👈 only navigate after preloader finishes
        }}
      />
    )}

    <div
      style={{
        display: 'flex',
        height: '100vh',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#f0f2f5',
      }}
    >
      {contextHolder}
      <Card style={{ width: 400 }}>
        <Title level={3} style={{ textAlign: 'center' }}>تسجيل الدخول</Title>
        <Form
          name="login_form"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            name="username"
            label="اسم المستخدم"
            rules={[{ required: true, message: 'يرجى إدخال اسم المستخدم' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="اسم المستخدم" />
          </Form.Item>

          <Form.Item
            name="password"
            label="كلمة المرور"
            rules={[{ required: true, message: 'يرجى إدخال كلمة المرور' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="كلمة المرور" />
          </Form.Item>

          <Form.Item name="remember" valuePropName="checked">
            <Checkbox>تذكرني</Checkbox>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              دخول
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  </>
);
};

export default Login;