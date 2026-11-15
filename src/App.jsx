import { HashRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import SemesterForm from './pages/SemesterForm';
import SemesterDetail from './pages/SemesterDetail';
import AcademicHistory from './pages/AcademicHistory';
import './App.css';

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <Navbar />
        <div className="app-container">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/history" element={<AcademicHistory />} />
            <Route path="/semester/new" element={<SemesterForm />} />
            <Route path="/semester/:id" element={<SemesterDetail />} />
            <Route path="/semester/:id/edit" element={<SemesterForm />} />
          </Routes>
        </div>
      </HashRouter>
    </AppProvider>
  );
}
