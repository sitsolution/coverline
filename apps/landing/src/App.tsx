import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        {/* Future: <Route path="/signup" element={<Signup />} /> */}
        {/* Future: <Route path="/login"  element={<Login />} /> */}
      </Routes>
    </BrowserRouter>
  );
}
