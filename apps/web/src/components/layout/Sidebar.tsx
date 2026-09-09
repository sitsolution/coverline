import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/auth';

const NAV = [
  { icon: '📊', label: 'Dashboard',  to: '/dashboard'  },
  { icon: '🩺', label: 'Shifts',     to: '/shifts'     },
  { icon: '👨‍⚕️', label: 'Staff',      to: '/staff'      },
  { icon: '📋', label: 'Bookings',   to: '/bookings'   },
  { icon: '📁', label: 'Documents',  to: '/documents'  },
  { icon: '📈', label: 'Reports',    to: '/reports'    },
  { icon: '⚙️', label: 'Settings',   to: '/settings'   },
];

export default function Sidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="w-[212px] flex-none bg-navy-3 flex flex-col" style={{ minHeight: '100vh' }}>
      {/* Brand */}
      <div className="flex items-center gap-2 px-[18px] py-[18px] border-b border-white/10 mb-[10px]">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M2 12h4l2-7 4 14 2-9 2 5h6" stroke="#5FB4E0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span className="font-display font-extrabold text-[13.5px] text-white">Coverline · Admin</span>
      </div>

      {/* Nav items */}
      <nav className="flex flex-col flex-1">
        {NAV.map(({ icon, label, to }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `adm-item${isActive ? ' active' : ''}`
            }
          >
            <span className="text-[14px] w-4 text-center">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-[18px] py-[13px] text-[12.5px] font-semibold text-white/60 hover:text-white hover:bg-white/10 transition-colors border-t border-white/10 w-full text-left"
      >
        <span className="text-[14px] w-4 text-center">🚪</span>
        Log out
      </button>
    </div>
  );
}
