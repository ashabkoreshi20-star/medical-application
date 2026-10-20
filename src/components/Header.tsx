import React, { useState } from 'react';
import { ActiveTab } from '../types';
import { useAuth } from '../context/AuthContext';
import { Menu, X, Calendar, User as UserIcon, LogOut, LogIn, Shield } from 'lucide-react';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenBooking: () => void;
  bookingCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenBooking,
  bookingCount,
}) => {
  const { user, userProfile, signOut, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const displayName = userProfile?.displayName || user?.displayName || user?.email?.split('@')[0] || 'Patient';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6 lg:gap-8 h-20">
          {/* Zone 1: Brand Zone - Single text element wordmark */}
          <button
            onClick={() => handleNavClick('home')}
            className="text-left text-xl sm:text-2xl font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 hover:text-teal-700 transition-colors"
          >
            We Care Hospitals
          </button>

          {/* Zone 2: Clean single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              onClick={() => handleNavClick('home')}
              className={`hover:text-teal-700 transition-colors whitespace-nowrap shrink-0 py-1 ${
                activeTab === 'home' ? 'text-teal-700 font-semibold border-b-2 border-teal-600' : ''
              }`}
            >
              Home
            </button>
            <button
              onClick={() => handleNavClick('about')}
              className={`hover:text-teal-700 transition-colors whitespace-nowrap shrink-0 py-1 ${
                activeTab === 'about' ? 'text-teal-700 font-semibold border-b-2 border-teal-600' : ''
              }`}
            >
              About
            </button>
            <button
              onClick={() => handleNavClick('departments')}
              className={`hover:text-teal-700 transition-colors whitespace-nowrap shrink-0 py-1 ${
                activeTab === 'departments' ? 'text-teal-700 font-semibold border-b-2 border-teal-600' : ''
              }`}
            >
              Departments
            </button>
            <button
              onClick={() => handleNavClick('doctors')}
              className={`hover:text-teal-700 transition-colors whitespace-nowrap shrink-0 py-1 ${
                activeTab === 'doctors' ? 'text-teal-700 font-semibold border-b-2 border-teal-600' : ''
              }`}
            >
              Doctors
            </button>
            <button
              onClick={() => handleNavClick('my-appointments')}
              className={`hover:text-teal-700 transition-colors whitespace-nowrap shrink-0 py-1 flex items-center gap-1.5 ${
                activeTab === 'my-appointments' ? 'text-teal-700 font-semibold border-b-2 border-teal-600' : ''
              }`}
            >
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>My Appointments</span>
              {bookingCount > 0 && (
                <span className="text-xs text-teal-700 font-semibold">
                  ({bookingCount})
                </span>
              )}
            </button>

            {/* Admin Portal Navigation Link */}
            <button
              onClick={() => handleNavClick('admin')}
              className={`hover:text-teal-700 transition-colors whitespace-nowrap shrink-0 py-1 flex items-center gap-1.5 ${
                activeTab === 'admin' ? 'text-teal-700 font-semibold border-b-2 border-teal-600' : ''
              }`}
            >
              <Shield className={`w-4 h-4 ${isAdmin ? 'text-teal-700' : 'text-slate-400'}`} />
              <span>Admin Portal</span>
              {isAdmin && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Admin Logged In" />
              )}
            </button>

            {/* Public Sign In Page Link or Account Page Link */}
            {!user ? (
              <button
                onClick={() => handleNavClick('signin')}
                className={`hover:text-teal-700 transition-colors whitespace-nowrap shrink-0 py-1 flex items-center gap-1.5 ${
                  activeTab === 'signin' ? 'text-teal-700 font-semibold border-b-2 border-teal-600' : ''
                }`}
              >
                <LogIn className="w-4 h-4 text-slate-400" />
                <span>Sign In</span>
              </button>
            ) : (
              <button
                onClick={() => handleNavClick('account')}
                className={`hover:text-teal-700 transition-colors whitespace-nowrap shrink-0 py-1 flex items-center gap-1.5 ${
                  activeTab === 'account' ? 'text-teal-700 font-semibold border-b-2 border-teal-600' : ''
                }`}
              >
                <UserIcon className="w-4 h-4 text-slate-400" />
                <span>Account &amp; Sign Out</span>
              </button>
            )}
          </nav>

          {/* Zone 3: 1 Primary Action + Quick Auth Actions */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            {isAdmin && (
              <button
                onClick={() => handleNavClick('admin')}
                className="px-3 py-1.5 text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-xl border border-teal-200 transition-colors flex items-center gap-1.5"
                title="Open Hospital Admin Console"
              >
                <Shield className="w-3.5 h-3.5 text-teal-700" />
                <span>Admin Console</span>
              </button>
            )}

            {user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleNavClick('account')}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                  title="Account Profile & Security"
                >
                  <div className="w-6 h-6 rounded-full bg-teal-700 text-white flex items-center justify-center text-xs">
                    {displayName[0].toUpperCase()}
                  </div>
                  <span className="max-w-[110px] truncate">{displayName}</span>
                </button>

                <button
                  onClick={async () => {
                    await signOut();
                    handleNavClick('home');
                  }}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  title="Sign Out"
                  aria-label="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleNavClick('signin')}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-teal-800 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-1.5 border border-slate-200"
              >
                <LogIn className="w-3.5 h-3.5 text-teal-700" />
                <span>Sign In Page</span>
              </button>
            )}

            <button
              onClick={onOpenBooking}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-xl transition-colors whitespace-nowrap shrink-0 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2"
            >
              Book Appointment
            </button>
          </div>

          {/* Mobile hamburger button */}
          <div className="flex md:hidden items-center gap-2">
            {!user ? (
              <button
                onClick={() => handleNavClick('signin')}
                className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 rounded-md"
              >
                Sign In
              </button>
            ) : (
              <button
                onClick={() => handleNavClick('account')}
                className="w-7 h-7 rounded-full bg-teal-700 text-white flex items-center justify-center text-xs font-bold"
                aria-label="Open patient account"
              >
                {displayName[0].toUpperCase()}
              </button>
            )}
            <button
              onClick={onOpenBooking}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-md whitespace-nowrap"
            >
              Book
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:bg-slate-100 rounded-lg focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-100 flex flex-col gap-2">
            {user && (
              <div className="p-3 bg-slate-50 rounded-xl mb-1 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900">{displayName}</p>
                  <p className="text-[11px] text-slate-500">{user.email}</p>
                </div>
                <button
                  onClick={async () => {
                    await signOut();
                    setMobileMenuOpen(false);
                    handleNavClick('home');
                  }}
                  className="text-xs text-rose-600 font-semibold"
                >
                  Sign Out
                </button>
              </div>
            )}

            <button
              onClick={() => handleNavClick('home')}
              className={`text-left px-3 py-2 text-sm font-medium rounded-md ${
                activeTab === 'home' ? 'bg-teal-50 text-teal-700 font-semibold' : 'text-slate-700'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => handleNavClick('about')}
              className={`text-left px-3 py-2 text-sm font-medium rounded-md ${
                activeTab === 'about' ? 'bg-teal-50 text-teal-700 font-semibold' : 'text-slate-700'
              }`}
            >
              About
            </button>
            <button
              onClick={() => handleNavClick('departments')}
              className={`text-left px-3 py-2 text-sm font-medium rounded-md ${
                activeTab === 'departments' ? 'bg-teal-50 text-teal-700 font-semibold' : 'text-slate-700'
              }`}
            >
              Departments
            </button>
            <button
              onClick={() => handleNavClick('doctors')}
              className={`text-left px-3 py-2 text-sm font-medium rounded-md ${
                activeTab === 'doctors' ? 'bg-teal-50 text-teal-700 font-semibold' : 'text-slate-700'
              }`}
            >
              Doctors
            </button>
            <button
              onClick={() => handleNavClick('my-appointments')}
              className={`text-left px-3 py-2 text-sm font-medium rounded-md flex items-center justify-between ${
                activeTab === 'my-appointments' ? 'bg-teal-50 text-teal-700 font-semibold' : 'text-slate-700'
              }`}
            >
              <span>My Appointments</span>
              {bookingCount > 0 && (
                <span className="text-xs font-semibold text-teal-800">
                  {bookingCount} active
                </span>
              )}
            </button>

            {/* Public Sign In Page / Account Page link in mobile nav */}
            {!user ? (
              <button
                onClick={() => handleNavClick('signin')}
                className={`text-left px-3 py-2 text-sm font-medium rounded-md flex items-center gap-2 ${
                  activeTab === 'signin' ? 'bg-teal-50 text-teal-700 font-semibold' : 'text-slate-700'
                }`}
              >
                <LogIn className="w-4 h-4 text-teal-700" />
                <span>Sign In / Register Page</span>
              </button>
            ) : (
              <button
                onClick={() => handleNavClick('account')}
                className={`text-left px-3 py-2 text-sm font-medium rounded-md flex items-center gap-2 ${
                  activeTab === 'account' ? 'bg-teal-50 text-teal-700 font-semibold' : 'text-slate-700'
                }`}
              >
                <UserIcon className="w-4 h-4 text-teal-700" />
                <span>Account Profile &amp; Sign Out</span>
              </button>
            )}

            {/* Admin Portal Mobile Item */}
            <button
              onClick={() => handleNavClick('admin')}
              className={`text-left px-3 py-2 text-sm font-medium rounded-md flex items-center justify-between ${
                activeTab === 'admin' ? 'bg-teal-50 text-teal-700 font-semibold' : 'text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-teal-700" />
                <span>Admin Management Portal</span>
              </div>
              {isAdmin && (
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  Admin
                </span>
              )}
            </button>

            <div className="pt-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenBooking();
                }}
                className="w-full py-2.5 text-center text-sm font-semibold text-white bg-teal-700 rounded-lg"
              >
                Book Appointment Now
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
