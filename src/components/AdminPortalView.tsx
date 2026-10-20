import React, { useState, useEffect, useMemo, useId } from 'react';
import { Appointment, Doctor, Department, ConsultationType, ActiveTab } from '../types';
import { DEPARTMENTS, DOCTORS } from '../data/hospitalData';
import { useAuth } from '../context/AuthContext';
import {
  fetchAllAppointmentsAdmin,
  saveAppointmentByAdmin,
  updateAppointmentDetailsByAdmin,
  updateAppointmentStatus,
  deleteAppointmentByAdmin,
  downloadCalendarEvent
} from '../utils/appointmentStorage';
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  Filter,
  Plus,
  RefreshCw,
  Download,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  Trash2,
  Eye,
  LogOut,
  ArrowLeft,
  Building,
  Check,
  X,
  Stethoscope,
  Video,
  FileSpreadsheet,
  Lock,
  ChevronDown
} from 'lucide-react';

interface AdminPortalViewProps {
  onNavigate: (tab: ActiveTab) => void;
}

export const AdminPortalView: React.FC<AdminPortalViewProps> = ({ onNavigate }) => {
  const { isAdmin, adminLogin, adminLogout, authError, clearAuthError } = useAuth();

  // Admin Login State
  const [adminEmailInput, setAdminEmailInput] = useState('ashabkoreshi09@gmail.com');
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Bookings state
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'confirmed' | 'completed' | 'cancelled'>('all');
  const [selectedDeptId, setSelectedDeptId] = useState<string>('all');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'upcoming' | 'past'>('all');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [viewingAppointment, setViewingAppointment] = useState<Appointment | null>(null);
  const [deletingAppointment, setDeletingAppointment] = useState<Appointment | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // New Booking Form State (Admin End)
  const [newPatientName, setNewPatientName] = useState('');
  const [newPatientEmail, setNewPatientEmail] = useState('');
  const [newPatientPhone, setNewPatientPhone] = useState('');
  const [newPatientAge, setNewPatientAge] = useState<number>(35);
  const [newPatientGender, setNewPatientGender] = useState<'male' | 'female' | 'other'>('male');
  const [newDeptId, setNewDeptId] = useState(DEPARTMENTS[0].id);
  const [newDoctorId, setNewDoctorId] = useState(DOCTORS[0].id);
  const [newDate, setNewDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [newTimeSlot, setNewTimeSlot] = useState(DOCTORS[0].timeSlots[0] || '10:00 AM');
  const [newConsultationType, setNewConsultationType] = useState<ConsultationType>('in-person');
  const [newReason, setNewReason] = useState('');
  const [newMedicalNotes, setNewMedicalNotes] = useState('Scheduled via Hospital Admin Terminal');
  const [newIsExisting, setNewIsExisting] = useState(false);
  const [newStatus, setNewStatus] = useState<'confirmed' | 'completed' | 'cancelled'>('confirmed');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Load all appointments
  const loadBookings = async () => {
    setLoading(true);
    try {
      const data = await fetchAllAppointmentsAdmin();
      setAppointments(data);
    } catch (err) {
      console.error('Failed to load appointments for admin:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadBookings();
    }
  }, [isAdmin]);

  // Handle Admin Login submission
  const handleAdminLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    clearAuthError();
    setLoginLoading(true);

    try {
      await adminLogin(adminEmailInput, adminPasswordInput);
    } catch (err: any) {
      setLoginError(err.message || 'Invalid administrator login credentials.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleQuickFillCredentials = () => {
    setAdminEmailInput('ashabkoreshi09@gmail.com');
    setAdminPasswordInput('12345');
    setLoginError(null);
  };

  // Doctors available for selected department in New Booking Form
  const doctorsInNewDept = useMemo(() => {
    return DOCTORS.filter(d => d.departmentId === newDeptId);
  }, [newDeptId]);

  // Whenever department changes in new booking form, select first doctor
  const handleDeptChange = (deptId: string) => {
    setNewDeptId(deptId);
    const docs = DOCTORS.filter(d => d.departmentId === deptId);
    if (docs.length > 0) {
      setNewDoctorId(docs[0].id);
      if (docs[0].timeSlots.length > 0) {
        setNewTimeSlot(docs[0].timeSlots[0]);
      }
    }
  };

  const handleDoctorChange = (docId: string) => {
    setNewDoctorId(docId);
    const doc = DOCTORS.find(d => d.id === docId);
    if (doc && doc.timeSlots.length > 0) {
      setNewTimeSlot(doc.timeSlots[0]);
    }
  };

  const currentSelectedDoctor = DOCTORS.find(d => d.id === newDoctorId) || DOCTORS[0];
  const currentSelectedDept = DEPARTMENTS.find(d => d.id === newDeptId) || DEPARTMENTS[0];

  // Save new booking from Admin End
  const handleCreateBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!newPatientName.trim()) {
      setFormError('Please enter the patient full name.');
      return;
    }
    if (!newPatientEmail.trim() || !newPatientEmail.includes('@')) {
      setFormError('Please enter a valid patient email address.');
      return;
    }
    if (!newPatientPhone.trim()) {
      setFormError('Please enter a patient contact phone number.');
      return;
    }
    if (!newReason.trim()) {
      setFormError('Please enter reason for visit.');
      return;
    }

    setFormSubmitting(true);
    try {
      const created = await saveAppointmentByAdmin({
        departmentId: currentSelectedDept.id,
        departmentName: currentSelectedDept.name,
        doctorId: currentSelectedDoctor.id,
        doctorName: currentSelectedDoctor.name,
        doctorTitle: currentSelectedDoctor.title,
        doctorFee: currentSelectedDoctor.consultationFee,
        appointmentDate: newDate,
        timeSlot: newTimeSlot,
        consultationType: newConsultationType,
        patientName: newPatientName.trim(),
        patientEmail: newPatientEmail.trim(),
        patientPhone: newPatientPhone.trim(),
        patientAge: Number(newPatientAge) || 30,
        patientGender: newPatientGender,
        reasonForVisit: newReason.trim(),
        medicalNotes: newMedicalNotes.trim(),
        isExistingPatient: newIsExisting,
        status: newStatus,
        userId: 'admin-scheduled'
      });

      // Update state
      setAppointments(prev => [created, ...prev]);
      setIsAddModalOpen(false);
      setActionSuccessMsg(`Booking ${created.referenceNumber} scheduled successfully for ${created.patientName}!`);
      setTimeout(() => setActionSuccessMsg(null), 5000);

      // Reset form
      setNewPatientName('');
      setNewPatientEmail('');
      setNewPatientPhone('');
      setNewReason('');
      setNewMedicalNotes('Scheduled via Hospital Admin Terminal');
    } catch (err: any) {
      setFormError(err.message || 'Failed to create booking.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Status update
  const handleUpdateStatus = async (id: string, status: 'confirmed' | 'completed' | 'cancelled') => {
    try {
      const updated = await updateAppointmentStatus(id, status);
      setAppointments(updated);
      setActionSuccessMsg(`Booking status updated to ${status.toUpperCase()}.`);
      setTimeout(() => setActionSuccessMsg(null), 3000);
      if (viewingAppointment && viewingAppointment.id === id) {
        setViewingAppointment(prev => prev ? { ...prev, status } : null);
      }
    } catch (err: any) {
      console.error('Failed to update status:', err);
    }
  };

  // Delete booking
  const handleDeleteBooking = async () => {
    if (!deletingAppointment) return;
    try {
      const remaining = await deleteAppointmentByAdmin(deletingAppointment.id);
      setAppointments(remaining);
      setDeletingAppointment(null);
      setActionSuccessMsg(`Booking ${deletingAppointment.referenceNumber} has been permanently deleted.`);
      setTimeout(() => setActionSuccessMsg(null), 3000);
      if (viewingAppointment?.id === deletingAppointment.id) {
        setViewingAppointment(null);
      }
    } catch (err) {
      console.error('Failed to delete appointment:', err);
    }
  };

  // Update full appointment from Edit modal
  const handleSaveEditAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAppointment) return;

    try {
      const updated = await updateAppointmentDetailsByAdmin(editingAppointment.id, {
        appointmentDate: editingAppointment.appointmentDate,
        timeSlot: editingAppointment.timeSlot,
        consultationType: editingAppointment.consultationType,
        status: editingAppointment.status,
        patientName: editingAppointment.patientName,
        patientPhone: editingAppointment.patientPhone,
        patientEmail: editingAppointment.patientEmail,
        reasonForVisit: editingAppointment.reasonForVisit,
        medicalNotes: editingAppointment.medicalNotes
      });
      setAppointments(updated);
      setEditingAppointment(null);
      setActionSuccessMsg(`Booking ${editingAppointment.referenceNumber} updated successfully.`);
      setTimeout(() => setActionSuccessMsg(null), 3000);
    } catch (err) {
      console.error('Failed to edit appointment:', err);
    }
  };

  // Filtered appointments list
  const filteredAppointments = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];

    return appointments.filter((item) => {
      // Status filter
      if (selectedStatus !== 'all' && item.status !== selectedStatus) {
        return false;
      }

      // Department filter
      if (selectedDeptId !== 'all' && item.departmentId !== selectedDeptId) {
        return false;
      }

      // Doctor filter
      if (selectedDoctorId !== 'all' && item.doctorId !== selectedDoctorId) {
        return false;
      }

      // Date filter
      if (dateFilter === 'today' && item.appointmentDate !== todayStr) {
        return false;
      }
      if (dateFilter === 'upcoming' && item.appointmentDate < todayStr) {
        return false;
      }
      if (dateFilter === 'past' && item.appointmentDate >= todayStr) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchName = item.patientName?.toLowerCase().includes(query);
        const matchRef = item.referenceNumber?.toLowerCase().includes(query);
        const matchEmail = item.patientEmail?.toLowerCase().includes(query);
        const matchPhone = item.patientPhone?.toLowerCase().includes(query);
        const matchDoc = item.doctorName?.toLowerCase().includes(query);
        const matchDept = item.departmentName?.toLowerCase().includes(query);
        return matchName || matchRef || matchEmail || matchPhone || matchDoc || matchDept;
      }

      return true;
    });
  }, [appointments, selectedStatus, selectedDeptId, selectedDoctorId, dateFilter, searchQuery]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = appointments.length;
    const confirmed = appointments.filter(a => a.status === 'confirmed').length;
    const completed = appointments.filter(a => a.status === 'completed').length;
    const cancelled = appointments.filter(a => a.status === 'cancelled').length;

    const todayStr = new Date().toISOString().split('T')[0];
    const todayCount = appointments.filter(a => a.appointmentDate === todayStr).length;

    // Revenue in BDT from non-cancelled appointments
    const totalRevenueBDT = appointments
      .filter(a => a.status !== 'cancelled')
      .reduce((sum, a) => sum + (a.doctorFee || 1500), 0);

    return { total, confirmed, completed, cancelled, todayCount, totalRevenueBDT };
  }, [appointments]);

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredAppointments.length === 0) return;

    const headers = [
      'Reference Number',
      'Date',
      'Time Slot',
      'Status',
      'Patient Name',
      'Age',
      'Gender',
      'Phone',
      'Email',
      'Department',
      'Doctor',
      'Fee (BDT)',
      'Consultation Type',
      'Reason',
      'Notes'
    ];

    const rows = filteredAppointments.map(a => [
      `"${a.referenceNumber}"`,
      `"${a.appointmentDate}"`,
      `"${a.timeSlot}"`,
      `"${a.status}"`,
      `"${a.patientName}"`,
      `"${a.patientAge}"`,
      `"${a.patientGender}"`,
      `"${a.patientPhone}"`,
      `"${a.patientEmail}"`,
      `"${a.departmentName}"`,
      `"${a.doctorName}"`,
      `"${a.doctorFee}"`,
      `"${a.consultationType}"`,
      `"${(a.reasonForVisit || '').replace(/"/g, '""')}"`,
      `"${(a.medicalNotes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `we-care-hospitals-bookings-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // -------------------------------------------------------------
  // VIEW 1: ADMIN LOGIN SCREEN (If not logged in as Admin)
  // -------------------------------------------------------------
  if (!isAdmin) {
    return (
      <div className="min-h-[85vh] bg-slate-900 text-slate-100 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-slate-800/90 backdrop-blur-md p-8 sm:p-10 rounded-3xl border border-slate-700 shadow-2xl">
          {/* Header */}
          <div className="text-center">
            <div className="w-16 h-16 bg-teal-500/20 text-teal-400 rounded-2xl mx-auto flex items-center justify-center border border-teal-500/30 mb-4 shadow-inner">
              <ShieldCheck className="w-9 h-9" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              We Care Hospitals
            </h2>
            <p className="text-xs uppercase tracking-widest font-semibold text-teal-400 mt-1">
              Restricted Administrative Portal
            </p>
            <p className="text-xs text-slate-400 mt-2">
              Only authorized hospital personnel can sign in to manage patient appointments, clinical slots, and records.
            </p>
          </div>

          {/* Pre-fill / Authorized Credentials notice */}
          <div className="bg-slate-700/50 border border-slate-600/80 rounded-2xl p-4 text-xs text-slate-300">
            <div className="flex items-center justify-between font-semibold text-slate-200 mb-1.5">
              <span className="flex items-center gap-1.5 text-teal-300">
                <Lock className="w-3.5 h-3.5" />
                <span>Authorized Admin Credentials</span>
              </span>
              <button
                type="button"
                onClick={handleQuickFillCredentials}
                className="text-[11px] bg-teal-700/80 hover:bg-teal-600 text-white px-2 py-0.5 rounded font-medium transition-colors"
              >
                Auto-fill Credentials
              </button>
            </div>
            <div className="space-y-0.5 font-mono text-[11px] text-slate-300">
              <p>Email: <span className="text-teal-300 font-bold">ashabkoreshi09@gmail.com</span></p>
              <p>Password: <span className="text-teal-300 font-bold">12345</span></p>
            </div>
          </div>

          {/* Error Message */}
          {(loginError || authError) && (
            <div className="bg-rose-950/70 border border-rose-800/80 rounded-xl p-3 flex items-start gap-2.5 text-xs text-rose-200">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Authentication Failed</p>
                <p>{loginError || authError}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form className="mt-6 space-y-4" onSubmit={handleAdminLoginSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Admin Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={adminEmailInput}
                  onChange={(e) => setAdminEmailInput(e.target.value)}
                  placeholder="ashabkoreshi09@gmail.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Security Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={adminPasswordInput}
                  onChange={(e) => setAdminPasswordInput(e.target.value)}
                  placeholder="Enter admin password (12345)"
                  className="w-full pl-10 pr-12 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-200 px-1 py-0.5"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full mt-2 py-3 px-4 bg-teal-600 hover:bg-teal-500 disabled:bg-teal-800 text-white font-semibold text-sm rounded-xl transition-colors shadow-lg shadow-teal-900/30 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loginLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying Administrative Credentials...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Access Admin Management Portal</span>
                </>
              )}
            </button>
          </form>

          {/* Footer Navigation */}
          <div className="pt-4 border-t border-slate-700 text-center">
            <button
              onClick={() => onNavigate('home')}
              className="text-xs text-slate-400 hover:text-teal-300 flex items-center justify-center gap-1.5 mx-auto transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Public Hospital Website</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 2: AUTHENTICATED ADMIN DASHBOARD & BOOKINGS MANAGEMENT
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 pb-20">
      {/* Admin Top Action Header */}
      <div className="bg-slate-900 text-white border-b border-slate-800 py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-600/30 text-teal-400 rounded-xl border border-teal-500/40">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">We Care Hospitals — Admin Portal</span>
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider">
                  Admin Verified
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Logged in: <span className="text-teal-300">ashabkoreshi09@gmail.com</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('home')}
              className="px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Patient Website</span>
            </button>
            <button
              onClick={async () => {
                await adminLogout();
                onNavigate('home');
              }}
              className="px-3 py-1.5 text-xs font-semibold text-rose-300 hover:text-white bg-rose-950/60 hover:bg-rose-900 rounded-xl border border-rose-800 transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Admin Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Title Bar & Quick Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Hospital Bookings Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Live consultation scheduling, clinical appointment triage, status management, and admin booking dispatch.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                setRefreshing(true);
                loadBookings();
              }}
              disabled={refreshing}
              className="px-3.5 py-2.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              title="Refresh records from database"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-teal-600' : 'text-slate-500'}`} />
              <span>Refresh</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              title="Export filtered records to CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2.5 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-xl shadow-sm transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Booking</span>
            </button>
          </div>
        </div>

        {/* Action Success Alert */}
        {actionSuccessMsg && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center justify-between text-xs sm:text-sm shadow-xs animate-in fade-in duration-200">
            <div className="flex items-center gap-2.5">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="font-semibold">{actionSuccessMsg}</span>
            </div>
            <button
              onClick={() => setActionSuccessMsg(null)}
              className="text-emerald-600 hover:text-emerald-800 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* KPI Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-6">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Bookings</p>
            <p className="text-2xl font-black text-slate-900 mt-1 tabular-nums">{stats.total}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">All time records</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <p className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">Confirmed</p>
            <p className="text-2xl font-black text-emerald-700 mt-1 tabular-nums">{stats.confirmed}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Active upcoming</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">Completed</p>
            <p className="text-2xl font-black text-blue-700 mt-1 tabular-nums">{stats.completed}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Patients served</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <p className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider">Cancelled</p>
            <p className="text-2xl font-black text-rose-600 mt-1 tabular-nums">{stats.cancelled}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Rescheduled/voided</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <p className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider">Today's Visits</p>
            <p className="text-2xl font-black text-amber-700 mt-1 tabular-nums">{stats.todayCount}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Scheduled for today</p>
          </div>

          <div className="bg-gradient-to-br from-teal-800 to-teal-950 p-4 rounded-2xl text-white shadow-xs">
            <p className="text-[11px] font-semibold text-teal-200 uppercase tracking-wider">Est. Revenue</p>
            <p className="text-2xl font-black text-white mt-1 tabular-nums">৳{stats.totalRevenueBDT.toLocaleString()}</p>
            <p className="text-[10px] text-teal-300 mt-0.5">BDT Consultation total</p>
          </div>
        </div>

        {/* Filter Controls & Search Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Search input */}
            <div className="md:col-span-5 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search patient name, reference (WCH-...), phone, doctor..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Department selector */}
            <div className="md:col-span-3">
              <select
                value={selectedDeptId}
                onChange={(e) => {
                  setSelectedDeptId(e.target.value);
                  setSelectedDoctorId('all');
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-600"
              >
                <option value="all">All Departments ({DEPARTMENTS.length})</option>
                {DEPARTMENTS.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            {/* Doctor selector */}
            <div className="md:col-span-2">
              <select
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-600"
              >
                <option value="all">All Doctors</option>
                {DOCTORS.filter(d => selectedDeptId === 'all' || d.departmentId === selectedDeptId).map(doc => (
                  <option key={doc.id} value={doc.id}>{doc.name}</option>
                ))}
              </select>
            </div>

            {/* Date filter */}
            <div className="md:col-span-2">
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-600"
              >
                <option value="all">All Dates</option>
                <option value="today">Today Only</option>
                <option value="upcoming">Upcoming Dates</option>
                <option value="past">Past Dates</option>
              </select>
            </div>
          </div>

          {/* Status Tabs Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400 font-medium mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" />
                <span>Status:</span>
              </span>
              {(['all', 'confirmed', 'completed', 'cancelled'] as const).map(status => {
                const isSelected = selectedStatus === status;
                return (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    className={`px-3 py-1.5 rounded-lg font-semibold capitalize transition-colors ${
                      isSelected
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {status}
                  </button>
                );
              })}
            </div>

            <div className="text-xs text-slate-500 font-medium">
              Showing <span className="font-bold text-slate-900">{filteredAppointments.length}</span> of {appointments.length} bookings
            </div>
          </div>
        </div>

        {/* Bookings List Section */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <RefreshCw className="w-8 h-8 text-teal-600 animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700">Loading Hospital Bookings...</p>
            <p className="text-xs text-slate-400 mt-1">Retrieving records from clinical database</p>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No Bookings Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No appointments matched your search filters. Try adjusting the search parameters or add a new patient booking.
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedStatus('all');
                  setSelectedDeptId('all');
                  setSelectedDoctorId('all');
                  setDateFilter('all');
                }}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                Reset All Filters
              </button>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg"
              >
                + Add Booking
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-4">Booking Ref</th>
                    <th className="py-3.5 px-4">Date &amp; Time</th>
                    <th className="py-3.5 px-4">Patient Information</th>
                    <th className="py-3.5 px-4">Specialist Doctor &amp; Dept</th>
                    <th className="py-3.5 px-4">Fee (BDT)</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredAppointments.map((item) => {
                    const isConfirmed = item.status === 'confirmed';
                    const isCompleted = item.status === 'completed';
                    const isCancelled = item.status === 'cancelled';

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Ref & Type */}
                        <td className="py-3.5 px-4 align-top">
                          <span className="font-mono font-bold text-slate-900 block text-xs">
                            #{item.referenceNumber}
                          </span>
                          <span className={`inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                            item.consultationType === 'video'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : 'bg-teal-50 text-teal-700 border border-teal-200'
                          }`}>
                            {item.consultationType === 'video' ? (
                              <>
                                <Video className="w-2.5 h-2.5" />
                                <span>Telehealth</span>
                              </>
                            ) : (
                              <>
                                <Building className="w-2.5 h-2.5" />
                                <span>OPD Clinic</span>
                              </>
                            )}
                          </span>
                        </td>

                        {/* Date & Time */}
                        <td className="py-3.5 px-4 align-top">
                          <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                            <span>{item.appointmentDate}</span>
                          </div>
                          <div className="text-slate-500 mt-0.5 flex items-center gap-1.5 text-[11px]">
                            <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{item.timeSlot}</span>
                          </div>
                        </td>

                        {/* Patient info */}
                        <td className="py-3.5 px-4 align-top">
                          <div className="font-bold text-slate-900 text-xs">
                            {item.patientName}
                            {item.patientAge && (
                              <span className="font-normal text-slate-500 ml-1">
                                ({item.patientAge}y, {item.patientGender || 'N/A'})
                              </span>
                            )}
                          </div>
                          <div className="text-slate-500 text-[11px] mt-0.5 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{item.patientPhone}</span>
                          </div>
                          <div className="text-slate-500 text-[11px] flex items-center gap-1 truncate max-w-[180px]">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span className="truncate">{item.patientEmail}</span>
                          </div>
                        </td>

                        {/* Doctor & Department */}
                        <td className="py-3.5 px-4 align-top">
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <Stethoscope className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                            <span>{item.doctorName}</span>
                          </div>
                          <div className="text-slate-500 text-[11px] mt-0.5">
                            {item.departmentName}
                          </div>
                          {item.reasonForVisit && (
                            <div className="text-slate-400 text-[11px] italic mt-0.5 truncate max-w-[200px]" title={item.reasonForVisit}>
                              "{item.reasonForVisit}"
                            </div>
                          )}
                        </td>

                        {/* Fee */}
                        <td className="py-3.5 px-4 align-top">
                          <span className="font-bold text-slate-900 tabular-nums">
                            ৳{item.doctorFee || 1500}
                          </span>
                          <span className="text-[10px] text-slate-400 block font-sans">BDT</span>
                        </td>

                        {/* Status badge */}
                        <td className="py-3.5 px-4 align-top">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                              isConfirmed
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : isCompleted
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isConfirmed
                                  ? 'bg-emerald-500'
                                  : isCompleted
                                  ? 'bg-blue-500'
                                  : 'bg-rose-500'
                              }`}
                            />
                            <span className="capitalize">{item.status}</span>
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 align-top text-right">
                          <div className="flex items-center justify-end gap-1">
                            {/* View full details */}
                            <button
                              onClick={() => setViewingAppointment(item)}
                              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                              title="View Patient Record"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* Status quick action */}
                            {isConfirmed && (
                              <button
                                onClick={() => handleUpdateStatus(item.id, 'completed')}
                                className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Mark as Completed"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}

                            {isConfirmed && (
                              <button
                                onClick={() => handleUpdateStatus(item.id, 'cancelled')}
                                className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                                title="Cancel Consultation"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}

                            {isCancelled && (
                              <button
                                onClick={() => handleUpdateStatus(item.id, 'confirmed')}
                                className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors"
                                title="Reopen / Confirm"
                              >
                                <RefreshCw className="w-4 h-4" />
                              </button>
                            )}

                            {/* Edit / Reschedule */}
                            <button
                              onClick={() => setEditingAppointment(item)}
                              className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
                              title="Edit Booking & Details"
                            >
                              <Edit className="w-4 h-4" />
                            </button>

                            {/* Download Calendar */}
                            <button
                              onClick={() => downloadCalendarEvent(item)}
                              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                              title="Download .ICS Calendar"
                            >
                              <Download className="w-4 h-4" />
                            </button>

                            {/* Delete permanently */}
                            <button
                              onClick={() => setDeletingAppointment(item)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Delete permanently"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Bottom table stats strip */}
            <div className="bg-slate-50 border-t border-slate-200 px-4 py-3 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-2">
              <div>
                Displaying {filteredAppointments.length} patient records
              </div>
              <div className="flex items-center gap-4">
                <span>Hospital Currency: <strong className="text-slate-800">BDT (৳)</strong></span>
                <span>•</span>
                <span>Server Time: <strong className="text-slate-800">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong></span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* MODAL 1: ADD NEW BOOKING (ADMIN END)                              */}
      {/* ----------------------------------------------------------------- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-800 mb-2">
                <Plus className="w-3.5 h-3.5" />
                <span>Admin Booking Terminal</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                Schedule New Patient Appointment
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Enter patient demographics and clinical details. The booking will be confirmed in the central hospital registry.
              </p>
            </div>

            {formError && (
              <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateBookingSubmit} className="space-y-4">
              {/* Patient Demographics */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">Patient Demographics</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={newPatientName}
                      onChange={(e) => setNewPatientName(e.target.value)}
                      placeholder="e.g. Tanvir Ahmed"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={newPatientPhone}
                      onChange={(e) => setNewPatientPhone(e.target.value)}
                      placeholder="+880 1711-XXXXXX"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={newPatientEmail}
                      onChange={(e) => setNewPatientEmail(e.target.value)}
                      placeholder="patient@example.com"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Age (Years)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={120}
                      value={newPatientAge}
                      onChange={(e) => setNewPatientAge(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Gender
                    </label>
                    <select
                      value={newPatientGender}
                      onChange={(e) => setNewPatientGender(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-600 focus:outline-none"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="existingPatientCheck"
                    checked={newIsExisting}
                    onChange={(e) => setNewIsExisting(e.target.checked)}
                    className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
                  />
                  <label htmlFor="existingPatientCheck" className="text-xs text-slate-600 cursor-pointer font-medium">
                    Patient has prior records / hospital MRN at We Care Hospitals
                  </label>
                </div>
              </div>

              {/* Department & Doctor Assignment */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">Clinical Department &amp; Doctor</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Specialty Department *
                    </label>
                    <select
                      value={newDeptId}
                      onChange={(e) => handleDeptChange(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-600 focus:outline-none"
                    >
                      {DEPARTMENTS.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Attending Specialist Doctor *
                    </label>
                    <select
                      value={newDoctorId}
                      onChange={(e) => handleDoctorChange(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-600 focus:outline-none"
                    >
                      {doctorsInNewDept.map(doc => (
                        <option key={doc.id} value={doc.id}>
                          {doc.name} — ৳{doc.consultationFee} BDT
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Doctor Room & Fee Summary */}
                <div className="p-3 bg-teal-50/70 border border-teal-200/60 rounded-xl flex items-center justify-between text-xs text-teal-900">
                  <div>
                    <p className="font-bold">{currentSelectedDoctor.name}</p>
                    <p className="text-[11px] text-teal-700">{currentSelectedDoctor.title} • {currentSelectedDoctor.roomNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-extrabold text-sm tabular-nums text-teal-950">৳{currentSelectedDoctor.consultationFee} BDT</p>
                    <p className="text-[10px] text-teal-700">Standard Consultation</p>
                  </div>
                </div>
              </div>

              {/* Date, Time & Format */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">Schedule &amp; Consultation Mode</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Consultation Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Time Slot *
                    </label>
                    <select
                      value={newTimeSlot}
                      onChange={(e) => setNewTimeSlot(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-600 focus:outline-none"
                    >
                      {currentSelectedDoctor.timeSlots.map(slot => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Consultation Format
                    </label>
                    <select
                      value={newConsultationType}
                      onChange={(e) => setNewConsultationType(e.target.value as ConsultationType)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-600 focus:outline-none"
                    >
                      <option value="in-person">Hospital OPD In-Person</option>
                      <option value="video">Telehealth Video Consult</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Initial Booking Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-600 focus:outline-none"
                  >
                    <option value="confirmed">Confirmed (Scheduled)</option>
                    <option value="completed">Completed (Already Seen)</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Clinical Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reason for Visit / Symptoms *
                </label>
                <input
                  type="text"
                  required
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  placeholder="e.g. Follow-up consultation, chest discomfort, post-operative review"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-600 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Administrative / Clinical Triage Notes
                </label>
                <textarea
                  rows={2}
                  value={newMedicalNotes}
                  onChange={(e) => setNewMedicalNotes(e.target.value)}
                  placeholder="Internal notes, payment status, allergy warnings..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-600 focus:bg-white focus:outline-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 disabled:bg-teal-900 rounded-xl transition-colors shadow-sm flex items-center gap-2"
                >
                  {formSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Recording Booking...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Confirm &amp; Dispatch Booking</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* MODAL 2: EDIT APPOINTMENT                                         */}
      {/* ----------------------------------------------------------------- */}
      {editingAppointment && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative">
            <button
              onClick={() => setEditingAppointment(null)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-slate-900 mb-1">
              Edit Booking #{editingAppointment.referenceNumber}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Update appointment schedule, consultation status, or patient visit details.
            </p>

            <form onSubmit={handleSaveEditAppointment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Patient Name</label>
                <input
                  type="text"
                  value={editingAppointment.patientName}
                  onChange={(e) => setEditingAppointment({ ...editingAppointment, patientName: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={editingAppointment.patientPhone}
                    onChange={(e) => setEditingAppointment({ ...editingAppointment, patientPhone: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={editingAppointment.patientEmail}
                    onChange={(e) => setEditingAppointment({ ...editingAppointment, patientEmail: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Appointment Date</label>
                  <input
                    type="date"
                    value={editingAppointment.appointmentDate}
                    onChange={(e) => setEditingAppointment({ ...editingAppointment, appointmentDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Time Slot</label>
                  <input
                    type="text"
                    value={editingAppointment.timeSlot}
                    onChange={(e) => setEditingAppointment({ ...editingAppointment, timeSlot: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Consultation Mode</label>
                  <select
                    value={editingAppointment.consultationType}
                    onChange={(e) => setEditingAppointment({ ...editingAppointment, consultationType: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    <option value="in-person">In-Person OPD</option>
                    <option value="video">Telehealth Video</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={editingAppointment.status}
                    onChange={(e) => setEditingAppointment({ ...editingAppointment, status: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  >
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Visit</label>
                <input
                  type="text"
                  value={editingAppointment.reasonForVisit}
                  onChange={(e) => setEditingAppointment({ ...editingAppointment, reasonForVisit: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Admin Notes</label>
                <textarea
                  rows={2}
                  value={editingAppointment.medicalNotes || ''}
                  onChange={(e) => setEditingAppointment({ ...editingAppointment, medicalNotes: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingAppointment(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-xl"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* MODAL 3: VIEW RECORD DETAILS                                      */}
      {/* ----------------------------------------------------------------- */}
      {viewingAppointment && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative">
            <button
              onClick={() => setViewingAppointment(null)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-sm font-bold bg-slate-100 text-slate-800 px-2.5 py-1 rounded-md">
                #{viewingAppointment.referenceNumber}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
                viewingAppointment.status === 'confirmed'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : viewingAppointment.status === 'completed'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}>
                {viewingAppointment.status}
              </span>
            </div>

            <h3 className="text-xl font-black text-slate-900">
              {viewingAppointment.patientName}
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Patient Consultation Record • We Care Hospitals Clinical Registry
            </p>

            <div className="space-y-4 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1.5">
                <p className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">Patient Contact</p>
                <p><span className="text-slate-500">Phone:</span> <strong className="text-slate-800">{viewingAppointment.patientPhone}</strong></p>
                <p><span className="text-slate-500">Email:</span> <strong className="text-slate-800">{viewingAppointment.patientEmail}</strong></p>
                <p><span className="text-slate-500">Age &amp; Gender:</span> <strong className="text-slate-800">{viewingAppointment.patientAge} years, {viewingAppointment.patientGender}</strong></p>
                <p><span className="text-slate-500">Patient Type:</span> <strong className="text-slate-800">{viewingAppointment.isExistingPatient ? 'Existing Patient' : 'New Patient'}</strong></p>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1.5">
                <p className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">Consultation Schedule</p>
                <p><span className="text-slate-500">Doctor:</span> <strong className="text-slate-800">{viewingAppointment.doctorName}</strong> ({viewingAppointment.doctorTitle})</p>
                <p><span className="text-slate-500">Department:</span> <strong className="text-slate-800">{viewingAppointment.departmentName}</strong></p>
                <p><span className="text-slate-500">Date &amp; Time:</span> <strong className="text-slate-800">{viewingAppointment.appointmentDate} at {viewingAppointment.timeSlot}</strong></p>
                <p><span className="text-slate-500">Consultation Fee:</span> <strong className="text-emerald-700 font-bold tabular-nums">৳{viewingAppointment.doctorFee || 1500} BDT</strong></p>
                <p><span className="text-slate-500">Format:</span> <strong className="text-slate-800">{viewingAppointment.consultationType === 'video' ? 'Video Telehealth' : 'In-Person OPD Clinic'}</strong></p>
              </div>

              {viewingAppointment.reasonForVisit && (
                <div>
                  <p className="font-bold text-slate-700 text-[11px] mb-1">Reason for Visit:</p>
                  <p className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 leading-relaxed">
                    {viewingAppointment.reasonForVisit}
                  </p>
                </div>
              )}

              {viewingAppointment.medicalNotes && (
                <div>
                  <p className="font-bold text-slate-700 text-[11px] mb-1">Admin / Clinical Notes:</p>
                  <p className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 text-amber-900 leading-relaxed font-mono text-[11px]">
                    {viewingAppointment.medicalNotes}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-slate-200 mt-6 flex flex-wrap items-center justify-between gap-2">
              <button
                onClick={() => downloadCalendarEvent(viewingAppointment)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .ICS</span>
              </button>

              <div className="flex items-center gap-2">
                {viewingAppointment.status !== 'completed' && (
                  <button
                    onClick={() => handleUpdateStatus(viewingAppointment.id, 'completed')}
                    className="px-3 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl"
                  >
                    Mark Completed
                  </button>
                )}
                {viewingAppointment.status !== 'cancelled' && (
                  <button
                    onClick={() => handleUpdateStatus(viewingAppointment.id, 'cancelled')}
                    className="px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* MODAL 4: DELETE CONFIRMATION                                      */}
      {/* ----------------------------------------------------------------- */}
      {deletingAppointment && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-center">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Permanently Delete Booking?
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Are you sure you want to delete booking <strong>#{deletingAppointment.referenceNumber}</strong> for <strong>{deletingAppointment.patientName}</strong>? This action cannot be undone.
            </p>

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={() => setDeletingAppointment(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteBooking}
                className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs"
              >
                Yes, Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
