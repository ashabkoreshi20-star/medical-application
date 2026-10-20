import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ActiveTab, Appointment } from '../types';
import {
  User,
  Mail,
  Phone,
  Calendar,
  LogOut,
  Trash2,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface AccountPageProps {
  onNavigate: (tab: ActiveTab) => void;
  appointments: Appointment[];
  onBookAppointment: () => void;
  onRefreshAppointments: () => void;
}

export const AccountPage: React.FC<AccountPageProps> = ({
  onNavigate,
  appointments,
  onBookAppointment,
  onRefreshAppointments
}) => {
  const { user, userProfile, signOut, deleteAccount, authError, clearAuthError } = useAuth();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // If user is not signed in, show guest prompt to sign in
  if (!user) {
    return (
      <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto pb-24">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm text-center space-y-5">
          <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <User className="w-7 h-7" />
          </div>
          <div>
            <span className="text-xs font-bold text-teal-800 tracking-wider uppercase">GUEST PATIENT</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              You are currently signed out
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-md mx-auto">
              Sign in with your patient account or Google to view your profile, manage active hospital visits, and control your account data.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('signin')}
              className="px-6 py-3 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-xl transition-colors shadow-sm"
            >
              Sign In to Patient Portal
            </button>
            <button
              onClick={() => onNavigate('home')}
              className="px-5 py-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const displayName = userProfile?.displayName || user.displayName || user.email?.split('@')[0] || 'Patient';
  const email = userProfile?.email || user.email || 'No email provided';
  const phone = userProfile?.phoneNumber || user.phoneNumber || 'Not specified';
  const provider = user.providerData?.[0]?.providerId === 'google.com' ? 'Google Account' : 'Email & Password';

  const userAppointments = appointments.filter(a => a.userId === user.uid || !a.userId);
  const activeBookingsCount = userAppointments.filter(a => a.status === 'confirmed').length;

  const handleSignOut = async () => {
    setIsSigningOut(true);
    setLocalError(null);
    try {
      await signOut();
      setIsSigningOut(false);
      onNavigate('home');
    } catch (err: any) {
      setIsSigningOut(false);
      setLocalError(err.message || 'Error signing out');
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setLocalError(null);
    clearAuthError();

    try {
      await deleteAccount();
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      onRefreshAppointments();
      onNavigate('home');
    } catch (err: any) {
      setIsDeleting(false);
      setLocalError(err.message || 'Account deletion failed');
    }
  };

  const activeError = localError || authError;

  return (
    <div className="py-12 lg:py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto pb-24 space-y-10">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold text-teal-800 tracking-wider uppercase">PATIENT PROFILE &amp; SECURITY</span>
          <h1 className="text-3xl font-extrabold text-slate-900 mt-1">
            Account Management &amp; Sign Out
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            View your verified credentials, access consultations, or permanently delete your account.
          </p>
        </div>

        <button
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="px-5 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-colors shadow-xs flex items-center gap-2 self-start sm:self-auto shrink-0"
        >
          <LogOut className="w-4 h-4 text-slate-500" />
          <span>{isSigningOut ? 'Signing Out...' : 'Sign Out'}</span>
        </button>
      </div>

      {/* Error banner */}
      {activeError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Important Notice</p>
            <p className="mt-0.5">{activeError}</p>
          </div>
        </div>
      )}

      {/* Main Profile & Appointment Stats Grid */}
      <div className="grid md:grid-cols-12 gap-6">
        {/* Left Card: Patient Info */}
        <div className="md:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-teal-700 text-white flex items-center justify-center font-bold text-2xl shadow-xs">
              {displayName[0].toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{displayName}</h2>
              <p className="text-xs font-medium text-teal-700 mt-0.5">Verified Patient Account</p>
              <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-400">
                <span>UID:</span>
                <span className="font-mono">{user.uid.substring(0, 14)}...</span>
              </div>
            </div>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400" />
                <span>Primary Email</span>
              </span>
              <span className="font-semibold text-slate-900">{email}</span>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400" />
                <span>Phone Number</span>
              </span>
              <span className="font-semibold text-slate-900">{phone}</span>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Sign-In Method</span>
              </span>
              <span className="font-semibold text-slate-900">{provider}</span>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-2">
                <Lock className="w-4 h-4 text-slate-400" />
                <span>Security Standard</span>
              </span>
              <span className="font-semibold text-teal-800">Firebase TLS 1.3 / ABAC Rules</span>
            </div>
          </div>
        </div>

        {/* Right Card: Quick Bookings Overview */}
        <div className="md:col-span-5 bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-teal-400 tracking-wider uppercase">YOUR VISITS</span>
            <h3 className="text-2xl font-bold mt-1">Consultation Status</h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Your booked appointments are synchronized with We Care Hospitals clinical departments and your patient profile.
            </p>

            <div className="mt-6 p-4 bg-slate-800/80 rounded-2xl border border-slate-700/80">
              <p className="text-3xl font-extrabold text-teal-300 tabular-nums">{activeBookingsCount}</p>
              <p className="text-xs text-slate-300 mt-0.5">Active Confirmed Consultation{activeBookingsCount === 1 ? '' : 's'}</p>
            </div>
          </div>

          <div className="pt-6 space-y-2">
            <button
              onClick={() => onNavigate('my-appointments')}
              className="w-full py-2.5 text-xs font-semibold text-slate-900 bg-teal-400 hover:bg-teal-300 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              <Calendar className="w-4 h-4" />
              <span>Go to My Appointments</span>
            </button>
            <button
              onClick={onBookAppointment}
              className="w-full py-2 text-xs font-medium text-slate-300 hover:text-white transition-colors"
            >
              + Schedule Another Visit
            </button>
          </div>
        </div>
      </div>

      {/* Sign Out Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h3 className="text-base font-bold text-slate-900">Sign Out of Patient Session</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xl leading-relaxed">
            Signing out will close your active session on this device. Your medical consultation records remain safely stored in the cloud.
          </p>
        </div>

        <button
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="px-6 py-2.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors whitespace-nowrap self-start sm:self-auto shrink-0 flex items-center gap-2"
        >
          <LogOut className="w-4 h-4 text-slate-600" />
          <span>{isSigningOut ? 'Signing Out...' : 'Sign Out Now'}</span>
        </button>
      </div>

      {/* Danger Zone: Permanent Account Deletion */}
      <div className="bg-rose-50/50 rounded-3xl border border-rose-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-rose-800 font-bold text-base">
              <Trash2 className="w-5 h-5 text-rose-600" />
              <span>Delete Patient Account</span>
            </div>
            <p className="text-xs text-rose-950 mt-1.5 max-w-xl leading-relaxed">
              Permanently delete your login credentials from Firebase Authentication and completely erase your patient profile and scheduled consultation passes from our database.
            </p>
          </div>

          {!showDeleteConfirm && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-5 py-2.5 text-xs font-semibold text-rose-700 bg-white border border-rose-300 hover:bg-rose-100 rounded-xl transition-colors shadow-xs whitespace-nowrap self-start sm:self-auto shrink-0"
            >
              Delete My Account
            </button>
          )}
        </div>

        {/* Delete Confirmation Warning Box */}
        {showDeleteConfirm && (
          <div className="mt-6 pt-6 border-t border-rose-200/80 space-y-4">
            <div className="p-4 bg-white rounded-2xl border border-rose-300 space-y-3">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-900">Are you absolutely sure?</p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    This action cannot be undone. Once deleted, your Firebase user account (<span className="font-semibold text-slate-800">{user.email}</span>) and all {userAppointments.length} associated appointments will be permanently purged.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-end gap-3">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Cancel &amp; Keep Account
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleDeleteAccount}
                  className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{isDeleting ? 'Deleting Account...' : 'Permanently Delete Everything'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
