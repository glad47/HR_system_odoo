import logo from './logo.svg';
import './App.css';
import MainPage from './components/MainPage';
import Login from './components/Login';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { useEffect, useState } from "react";
import { fetchDepartments } from "./utils/departments"; // adjust path as needed

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
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/main" element={<MainPage />} />

          {/* ✅ Dynamically generate department routes */}
          {departments.map(dept => (
            <Route
              key={dept.id}
              path={`/department/${dept.name}`}
              element={<MainPage department={dept} />}
            />
          ))}
        </Routes>
      </Router>
    </div>
  );
}

export default App;
