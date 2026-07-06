import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import MobileLayout from './layouts/MobileLayout';
import Login from './pages/Login';
import Home from './pages/Home';
import Expenses from './pages/Expenses';
import Add from './pages/Add';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import Savings from './pages/Savings';
import Settings from './pages/Settings';

const App = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="h-screen w-full flex items-center justify-center bg-slate-900"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div></div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        
        {/* Protected Routes */}
        <Route element={user ? <MobileLayout /> : <Navigate to="/login" />}>
          <Route path="/" element={<Home />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/add" element={<Add />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/savings" element={<Savings />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
