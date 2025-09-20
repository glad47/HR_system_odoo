import logo from './logo.svg';
import './App.css';
import MainPage from './components/MainPage';
import Login from './components/Login';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <div className="App">
      <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/main" element={<MainPage />} />
      </Routes>
    </Router>
    
      
    </div>
  );
}

export default App;
