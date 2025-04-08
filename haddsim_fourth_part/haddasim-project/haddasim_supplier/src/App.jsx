
import './App.css'
import { useState, createContext, useContext } from 'react';
import Register from "./components/Register"
import { BrowserRouter as Router, Routes, Navigate, Route } from "react-router-dom";
import ViewOrders from './components/ViewOrders';
export const AuthContext = createContext();

function App() {
  const [auth, setAuth] = useState(null);
  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Register type="login" />} />
          <Route path="/signup" element={<Register type="signup" />} />
          <Route path="/vieworders/:id" element={<ViewOrders />} />
          <Route path="*" element={<h1>404: Page Not Found</h1>} />
        </Routes>
      </Router>
    </AuthContext.Provider >
  );

}

export default App