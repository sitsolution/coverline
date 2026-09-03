import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLogin from './pages/AdminLogin';
import Dashboard from './pages/Dashboard';
import ShiftsManagement from './pages/ShiftsManagement';
import CreateShift from './pages/CreateShift';
import ShiftDetails from './pages/ShiftDetails';
import StaffDatabase from './pages/StaffDatabase';
import StaffProfile from './pages/StaffProfile';
import Bookings from './pages/Bookings';
import BookingDetails from './pages/BookingDetails';
import DocumentVerification from './pages/DocumentVerification';
import Reports from './pages/Reports';
import CalendarView from './pages/CalendarView';
import NotificationsCenter from './pages/NotificationsCenter';
import AdminSettings from './pages/AdminSettings';
import AddAdminUser from './pages/AddAdminUser';
import InvoicesBilling from './pages/InvoicesBilling';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login"             element={<AdminLogin />} />
        <Route path="/dashboard"         element={<Dashboard />} />
        <Route path="/shifts"            element={<ShiftsManagement />} />
        <Route path="/shifts/new"        element={<CreateShift />} />
        <Route path="/shifts/:id"        element={<ShiftDetails />} />
        <Route path="/staff"             element={<StaffDatabase />} />
        <Route path="/staff/:id"         element={<StaffProfile />} />
        <Route path="/bookings"          element={<Bookings />} />
        <Route path="/bookings/:id"      element={<BookingDetails />} />
        <Route path="/documents"         element={<DocumentVerification />} />
        <Route path="/reports"           element={<Reports />} />
        <Route path="/calendar"          element={<CalendarView />} />
        <Route path="/notifications"     element={<NotificationsCenter />} />
        <Route path="/settings"          element={<AdminSettings />} />
        <Route path="/settings/add-user" element={<AddAdminUser />} />
        <Route path="/billing"           element={<InvoicesBilling />} />
        <Route path="*"                  element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
