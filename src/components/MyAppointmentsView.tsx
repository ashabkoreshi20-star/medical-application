import React, { useState } from 'react';
import { Appointment } from '../types';
import { DOCTORS } from '../data/hospitalData';
import { useAuth } from '../context/AuthContext';
import {
  updateAppointmentStatus,
  rescheduleAppointment,
  downloadCalendarEvent
} from '../utils/appointmentStorage';
import {
  Calendar,
  Clock,
  User as UserIcon,
  Phone,
  Building2,
  Video,
  Download,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Plus,
  RefreshCw,
  LogIn,
  CloudCheck,
  ShieldCheck
} from 'lucide-react';

interface MyAppointmentsViewProps {
  appointments: Appointment[];
  onRefresh: () => void;
  onBookNew: () => void;
  onOpenAuth?: (mode?: 'signin' | 'signup') => void;
}

export const MyAppointmentsView: React.FC<MyAppointmentsViewProps> = ({
  appointments,
  onRefresh,
  onBookNew,
  onOpenAuth
}) => {
  const { user, userProfile } = useAuth();
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'cancelled'>('all');
  const [reschedulingApt, setReschedulingApt] = useState<Appointment | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newSlot, setNewSlot] = useState('');
  const [cancelTargetId, setCancelTargetId] = useState<string | null>(null);

  const filtered = appointments.filter(a => {
    if (filter === 'all') return true;
    return a.status === filter;
  });

  const handleCancel = async (id: string) => {
    await updateAppointmentStatus(id, 'cancelled');
    setCancelTargetId(null);
    onRefresh();
  };

  const handleSaveReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reschedulingApt || !newDate || !newSlot) return;
    await rescheduleAppointment(reschedulingApt.id, newDate, newSlot);
    setReschedulingApt(null);
    setNewDate('');
    setNewSlot('');
    onRefresh();
  };

  const doctorForReschedule = reschedulingApt
    ? DOCTORS.find(d => d.id === reschedulingApt.doctorId)
    : null;

  const displayName = userProfile?.displayName || user?.displayName || user?.email?.split('@')[0] || 'Patient';

  return (
    <div className="space-y-10 pb-20">
      {/* 1. Header Banner */}
      <section className="bg-white border-b border-slate-200 py-10 lg:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-teal-800 tracking-wider uppercase">PATIENT PORTAL</span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2 tracking-tight">
                My Scheduled Appointments
              </h1>
              <p className="text-sm text-slate-600 mt-2">
                Manage your consultations, download calendar passes, reschedule, or cancel bookings.
              </p>
            </div>

            <button
              onClick={onBookNew}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-xl transition-colors shadow-sm flex items-center gap-2 self-start sm:self-auto shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Book New Appointment</span>
            </button>
          </div>

          {/* Account status strip */}
          <div className="mt-6 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            {user ? (
              <div className="flex items-center gap-2.5 text-slate-800">
                <div className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs">
                  {displayName[0].toUpperCase()}
                </div>
                <div>
                  <span className="font-bold">{displayName}</span>
                  <span className="text-slate-500"> ({user.email}) · </span>
                  <span className="text-emerald-700 font-medium">Cloud Synced via Firebase</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2 text-slate-600">
                  <UserIcon className="w-4 h-4 text-slate-400" />
                  <span>Sign in to automatically sync and access your appointments across all devices.</span>
                </div>
                {onOpenAuth && (
                  <button
                    onClick={() => onOpenAuth('signin')}
                    className="px-3 py-1 font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-lg border border-teal-200"
                  >
                    Sign In / Register
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Filter segment tabs */}
          <div className="mt-6 flex items-center gap-2 text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All Bookings ({appointments.length})
            </button>
            <button
              onClick={() => setFilter('confirmed')}
              className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors ${
                filter === 'confirmed'
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Confirmed ({appointments.filter(a => a.status === 'confirmed').length})
            </button>
            <button
              onClick={() => setFilter('cancelled')}
              className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors ${
                filter === 'cancelled'
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Cancelled ({appointments.filter(a => a.status === 'cancelled').length})
            </button>
          </div>
        </div>
      </section>

      {/* 2. Appointments List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto space-y-4">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No appointments found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You currently do not have any {filter !== 'all' ? filter : ''} appointments on file. Schedule a consultation with our specialist doctors today.
            </p>
            <button
              onClick={onBookNew}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-xl transition-colors shadow-sm inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Schedule an Appointment</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((apt) => {
              const isConfirmed = apt.status === 'confirmed';
              return (
                <div
                  key={apt.id}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                >
                  {/* Left Column: Doctor & Schedule */}
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                        #{apt.referenceNumber}
                      </span>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded ${
                          isConfirmed
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border border-rose-200'
                        }`}
                      >
                        {isConfirmed ? 'Confirmed' : 'Cancelled'}
                      </span>
                      <span className="text-xs text-slate-400">·</span>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        {apt.consultationType === 'in-person' ? (
                          <>
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                            <span>In-Person OPD</span>
                          </>
                        ) : (
                          <>
                            <Video className="w-3.5 h-3.5 text-teal-600" />
                            <span>Telehealth Video</span>
                          </>
                        )}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{apt.doctorName}</h3>
                      <p className="text-xs text-teal-700 font-medium">{apt.doctorTitle} · {apt.departmentName}</p>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3 text-xs text-slate-600 pt-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="font-semibold text-slate-900 tabular-nums">{apt.appointmentDate}</span>
                        <span>at</span>
                        <span className="font-semibold text-slate-900 tabular-nums">{apt.timeSlot}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <UserIcon className="w-4 h-4 text-slate-400" />
                        <span>Patient: {apt.patientName} ({apt.patientAge}y)</span>
                      </div>
                    </div>

                    {apt.reasonForVisit && (
                      <p className="text-xs text-slate-500 italic">
                        Reason: {apt.reasonForVisit}
                      </p>
                    )}
                  </div>

                  {/* Right Column: Actions */}
                  <div className="flex flex-wrap lg:flex-col items-center lg:items-end gap-2.5 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    <p className="text-base font-bold text-slate-900 tabular-nums mb-1">
                      ৳{apt.doctorFee} BDT <span className="text-xs font-normal text-slate-500">OPD fee</span>
                    </p>

                    {isConfirmed && (
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => downloadCalendarEvent(apt)}
                          className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors flex items-center gap-1.5"
                          title="Download Calendar (.ics) event"
                        >
                          <Download className="w-3.5 h-3.5 text-slate-500" />
                          <span>Calendar (.ics)</span>
                        </button>

                        <button
                          onClick={() => {
                            setReschedulingApt(apt);
                            setNewDate(apt.appointmentDate);
                            setNewSlot(apt.timeSlot);
                          }}
                          className="px-3 py-1.5 text-xs font-medium text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-lg border border-teal-200 transition-colors flex items-center gap-1"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Reschedule</span>
                        </button>

                        <button
                          onClick={() => setCancelTargetId(apt.id)}
                          className="px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reschedule Modal */}
      {reschedulingApt && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">Reschedule Consultation</h3>
            <p className="text-xs text-slate-500 mb-4">
              With {reschedulingApt.doctorName} (#{reschedulingApt.referenceNumber})
            </p>

            <form onSubmit={handleSaveReschedule} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  New Consultation Date
                </label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  New Time Slot
                </label>
                <select
                  required
                  value={newSlot}
                  onChange={(e) => setNewSlot(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                >
                  {(doctorForReschedule?.timeSlots || ['09:00 AM', '10:30 AM', '02:00 PM', '04:00 PM']).map(slot => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReschedulingApt(null)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-xl"
                >
                  Save New Date &amp; Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Prompt */}
      {cancelTargetId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Cancel Appointment?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you wish to cancel this appointment slot? You can always reschedule or re-book later.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setCancelTargetId(null)}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                Keep Booking
              </button>
              <button
                onClick={() => handleCancel(cancelTargetId)}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl"
              >
                Yes, Cancel Slot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
