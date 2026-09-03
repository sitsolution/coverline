import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-paper flex items-start justify-center">
      <div className="w-full max-w-[380px] mt-[60px] text-center">

        {/* Logo */}
        <div className="w-[52px] h-[52px] rounded-[14px] bg-navy flex items-center justify-center mx-auto mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M2 12h4l2-7 4 14 2-9 2 5h6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* Heading */}
        <h1 className="font-display font-extrabold text-[19px] text-ink mb-[4px]">Welcome back</h1>
        <p className="text-[11.5px] text-slate mb-5">Login to your facility dashboard</p>

        {/* Form */}
        <div className="text-left">
          <div className="mb-[13px]">
            <label className="block text-[11.5px] font-bold text-slate mb-[6px]">Email Address</label>
            <input
              type="email"
              placeholder="admin@stjosephhosp.in"
              className="w-full px-3 py-[11px] border-[1.4px] border-line rounded-[9px] text-[13px] text-ink outline-none focus:border-navy-2 bg-white"
            />
          </div>
          <div className="mb-[13px]">
            <label className="block text-[11.5px] font-bold text-slate mb-[6px]">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-3 py-[11px] border-[1.4px] border-line rounded-[9px] text-[13px] text-ink outline-none focus:border-navy-2 bg-white"
            />
          </div>
        </div>

        {/* Forgot password */}
        <div className="text-right text-[11.5px] font-bold text-navy-2 cursor-pointer mb-4" style={{ marginTop: '-6px' }}>
          Forgot Password?
        </div>

        {/* Login button */}
        <button
          onClick={() => navigate('/dashboard')}
          className="w-full bg-navy text-white text-[13px] font-bold px-4 py-[11px] rounded-[10px]"
        >
          Login
        </button>

        {/* Footer */}
        <p className="text-[11.5px] text-slate mt-4">
          New facility?{' '}
          <span className="font-bold text-navy cursor-pointer">Request Demo</span>
        </p>
      </div>
    </div>
  );
}
