import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ActiveTab } from '../types';
import {
  LogIn,
  UserPlus,
  Mail,
  Lock,
  User,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  AlertCircle,
  ArrowRight,
  Stethoscope
} from 'lucide-react';

interface SignInPageProps {
  onNavigate: (tab: ActiveTab) => void;
  onBookAppointment: () => void;
}

export const SignInPage: React.FC<SignInPageProps> = ({ onNavigate, onBookAppointment }) => {
  const { user, userProfile, signInWithEmail, signUpWithEmail, signInWithGoogle, signOut, authError, clearAuthError } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleModeSwitch = (newMode: 'signin' | 'signup') => {
    setMode(newMode);
    clearAuthError();
    setLocalError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearAuthError();
    setSubmitting(true);

    try {
      if (mode === 'signup') {
        if (!displayName.trim()) {
          setLocalError('Please enter your full name.');
          setSubmitting(false);
          return;
        }
        if (password.length < 6) {
          setLocalError('Password must be at least 6 characters.');
          setSubmitting(false);
          return;
        }
        await signUpWithEmail(email.trim(), password, displayName.trim(), phone.trim());
      } else {
        await signInWithEmail(email.trim(), password);
      }
      setSubmitting(false);
      onNavigate('my-appointments');
    } catch (err: any) {
      setSubmitting(false);
      setLocalError(err.message || 'Authentication error');
    }
  };

  const handleGoogleSignIn = async () => {
    setLocalError(null);
    clearAuthError();
    setSubmitting(true);
    try {
      await signInWithGoogle();
      setSubmitting(false);
      onNavigate('my-appointments');
    } catch (err: any) {
      setSubmitting(false);
      setLocalError(err.message || 'Google sign-in error');
    }
  };

  const activeError = localError || authError;

  // If user is already signed in, show logged-in welcome view
  if (user) {
    const currentName = userProfile?.displayName || user.displayName || user.email?.split('@')[0] || 'Patient';
    return (
      <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto pb-24">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center mx-auto text-xl font-bold border border-teal-100">
            {currentName[0].toUpperCase()}
          </div>

          <div>
            <span className="text-xs font-bold text-teal-800 tracking-wider uppercase">AUTHENTICATED PATIENT</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              You are signed in as {currentName}
            </h1>
            <p className="text-xs text-slate-500 mt-1">{user.email}</p>
          </div>

          <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            Your patient portal is active. You can manage your consultations, check doctor schedules, or view your account security.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('my-appointments')}
              className="px-6 py-3 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-xl transition-colors shadow-sm flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>View My Appointments</span>
            </button>

            <button
              onClick={() => onNavigate('account')}
              className="px-6 py-3 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors flex items-center gap-2"
            >
              <User className="w-4 h-4 text-teal-700" />
              <span>Account Settings &amp; Sign Out</span>
            </button>

            <button
              onClick={() => onBookAppointment()}
              className="px-6 py-3 text-xs font-semibold text-teal-900 bg-teal-50 hover:bg-teal-100 rounded-xl transition-colors border border-teal-200"
            >
              Book New Consultation
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 lg:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-24">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="text-xs font-bold text-teal-800 tracking-wider uppercase">SECURE PATIENT PORTAL</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2 tracking-tight [text-wrap:balance]">
          Sign In or Create Your Patient Account
        </h1>
        <p className="text-sm text-slate-600 mt-3 leading-relaxed">
          Access your appointments, medical department consultations, and personalized healthcare records at We Care Hospitals.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start max-w-5xl mx-auto">
        {/* Left Column: Form Card */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          {/* Tab Selector */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => handleModeSwitch('signin')}
              className={`py-2.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 ${
                mode === 'signin'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LogIn className="w-4 h-4 text-teal-700" />
              <span>Sign In to Portal</span>
            </button>
            <button
              type="button"
              onClick={() => handleModeSwitch('signup')}
              className={`py-2.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 ${
                mode === 'signup'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserPlus className="w-4 h-4 text-teal-700" />
              <span>Create New Account</span>
            </button>
          </div>

          {/* Error Banner */}
          {activeError && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Notice</p>
                <p className="mt-0.5">{activeError}</p>
              </div>
            </div>
          )}

          {/* One-Click Google Authentication */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={submitting}
            className="w-full py-3 px-4 mb-4 text-xs font-semibold text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-colors shadow-xs flex items-center justify-center gap-3 disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google Account</span>
          </button>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-slate-400">or with email address</span>
            </div>
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Eleanor Vance"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Contact Phone Number (Optional)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="tel"
                      placeholder="+1 (555) 349-2918"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-600 focus:outline-none"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-600 focus:outline-none"
                />
              </div>
              {mode === 'signup' && (
                <p className="text-[11px] text-slate-400 mt-1">Minimum 6 characters</p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-xl transition-colors shadow-sm disabled:opacity-50 mt-2"
            >
              {submitting ? 'Authenticating...' : mode === 'signin' ? 'Sign In to Portal' : 'Register Free Patient Account'}
            </button>
          </form>

          {/* Bottom helper switch */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            {mode === 'signin' ? (
              <p>
                New patient?{' '}
                <button
                  type="button"
                  onClick={() => handleModeSwitch('signup')}
                  className="font-bold text-teal-700 hover:underline"
                >
                  Create an account now
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => handleModeSwitch('signin')}
                  className="font-bold text-teal-700 hover:underline"
                >
                  Sign in here
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Portal Benefits */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-sm">
            <span className="text-xs font-bold text-teal-400 tracking-wider uppercase">PORTAL PRIVILEGES</span>
            <h2 className="text-xl font-bold mt-1">Why Register with We Care Hospitals?</h2>

            <ul className="mt-6 space-y-4 text-xs text-slate-300">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-teal-400 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-white">Instant Online Appointments</p>
                  <p className="text-slate-400 mt-0.5">Directly choose your specialist doctor and time slot without waiting on phone queues.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-teal-400 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-white">Multi-Device Cloud Synchronization</p>
                  <p className="text-slate-400 mt-0.5">All scheduled hospital visits are securely backed up in your Firebase patient cloud.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-teal-400 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-white">Digital Pass &amp; Calendar Export</p>
                  <p className="text-slate-400 mt-0.5">Download `.ics` calendar events and appointment vouchers with reference codes.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <ShieldCheck className="w-4 h-4 text-teal-400 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-white">Data Privacy &amp; Full Control</p>
                  <p className="text-slate-400 mt-0.5">Your medical consultation notes are private. You can manage or delete your account at any time.</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="p-5 bg-teal-50 rounded-2xl border border-teal-200 text-xs text-teal-950 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Stethoscope className="w-5 h-5 text-teal-700 shrink-0" />
              <div>
                <p className="font-bold">Need Immediate Clinical Assistance?</p>
                <p className="text-[11px] text-teal-800">Our 24/7 Trauma desk is open for walk-ins without prior sign-in.</p>
              </div>
            </div>
            <a href="tel:+18009322731" className="font-bold text-teal-900 underline whitespace-nowrap ml-2">
              Call Hotline
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
