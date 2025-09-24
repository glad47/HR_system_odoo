import logo from './logo.svg';
import './App.css';
import MainPage from './components/MainPage';
import Login from './components/Login';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { useEffect, useState } from "react";
import { fetchDepartments } from "./utils/departments"; // adjust path as needed
import LoanPage from './components/LoanPage';
import HolidayPage from './components/HolidayPage';

function App() {
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    const loadDepartments = async () => {
      const result = await fetchDepartments();
      setDepartments(result);
    };
    loadDepartments();
  }, []);

  return (
    <div className="App" dir="rtl">
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/main" element={<MainPage />} department={null} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
