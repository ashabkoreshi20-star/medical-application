import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  X,
  User,
  Mail,
  Phone,
  Calendar,
  LogOut,
  Trash2,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Lock
} from 'lucide-react';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingCount: number;
  onViewBookings: () => void;
  onAccountDeleted?: () => void;
}

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  bookingCount,
  onViewBookings,
  onAccountDeleted
}) => {
  const { user, userProfile, signOut, deleteAccount, authError, clearAuthError } = useAuth();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string | null>(null);

  if (!isOpen || !user) return null;

  const displayName = userProfile?.displayName || user.displayName || user.email?.split('@')[0] || 'Patient';
  const email = userProfile?.email || user.email || 'No email provided';
  const phone = userProfile?.phoneNumber || user.phoneNumber || 'Not specified';
  const provider = user.providerData?.[0]?.providerId === 'google.com' ? 'Google Account' : 'Email & Password';

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setDeleteErrorMessage(null);
    clearAuthError();

    try {
      await deleteAccount();
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      if (onAccountDeleted) onAccountDeleted();
      onClose();
    } catch (err: any) {
      setIsDeleting(false);
      setDeleteErrorMessage(err.message || 'Failed to delete account.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div
        className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Close account dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-teal-700 text-white flex items-center justify-center font-bold text-lg shadow-sm">
            {displayName[0].toUpperCase()}
          </div>
          <div>
            <span className="text-xs font-bold text-teal-800 tracking-wider uppercase">PATIENT PROFILE</span>
            <h2 className="text-xl font-extrabold text-slate-900 leading-tight">{displayName}</h2>
            <p className="text-xs text-slate-500">{email}</p>
          </div>
        </div>

        {/* Patient Profile Details Card */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3 mb-6 text-xs">
          <div className="flex items-center justify-between py-1 border-b border-slate-200/70">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>Registered Email</span>
            </span>
            <span className="font-semibold text-slate-900">{email}</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-200/70">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>Contact Phone</span>
            </span>
            <span className="font-semibold text-slate-900">{phone}</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-200/70">
            <span className="text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Authentication Type</span>
            </span>
            <span className="font-semibold text-slate-900">{provider}</span>
          </div>

          <div className="flex items-center justify-between py-1">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Active Consultations</span>
            </span>
            <button
              onClick={() => {
                onClose();
                onViewBookings();
              }}
              className="font-bold text-teal-800 hover:underline"
            >
              {bookingCount} {bookingCount === 1 ? 'Booking' : 'Bookings'} →
            </button>
          </div>
        </div>

        {/* Error message banner */}
        {deleteErrorMessage && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <p>{deleteErrorMessage}</p>
          </div>
        )}

        {/* Public Action Buttons */}
        {!showDeleteConfirm ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onViewBookings();
                }}
                className="py-2.5 px-4 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <Calendar className="w-3.5 h-3.5 text-teal-700" />
                <span>My Appointments</span>
              </button>

              <button
                type="button"
                onClick={handleSignOut}
                className="py-2.5 px-4 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5 text-slate-600" />
                <span>Sign Out</span>
              </button>
            </div>

            {/* Danger Zone: Delete Account */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="text-[11px] text-slate-400">
                <span>Permanently remove your account &amp; data</span>
              </div>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="text-xs font-semibold text-rose-600 hover:text-rose-800 hover:underline flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Account</span>
              </button>
            </div>
          </div>
        ) : (
          /* Delete Account Confirmation Dialog */
          <div className="p-4 bg-rose-50/80 rounded-2xl border border-rose-200 space-y-3">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-rose-950">Are you sure you want to delete your account?</p>
                <p className="text-xs text-rose-800 mt-1 leading-relaxed">
                  This action is permanent and cannot be undone. Your Firebase credentials, profile records, and all scheduled appointment passes will be completely deleted from our database.
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteAccount}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs disabled:opacity-50 flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Deleting...' : 'Yes, Delete My Account'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
