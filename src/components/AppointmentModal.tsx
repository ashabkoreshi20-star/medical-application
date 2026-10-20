import React, { useState, useEffect } from 'react';
import { Department, Doctor, Appointment, ConsultationType } from '../types';
import { DEPARTMENTS, DOCTORS } from '../data/hospitalData';
import { saveAppointment, downloadCalendarEvent } from '../utils/appointmentStorage';
import { useAuth } from '../context/AuthContext';
import {
  X,
  Calendar as CalendarIcon,
  Clock,
  User as UserIcon,
  Phone,
  Mail,
  CheckCircle2,
  Download,
  AlertCircle,
  FileText,
  Video,
  Building2,
  Stethoscope,
  Lock,
  UserCheck,
  LogIn
} from 'lucide-react';
import { DoctorAvatar } from './DoctorAvatar';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDoctor?: Doctor | null;
  initialDepartmentId?: string | null;
  onAppointmentBooked: (appointment: Appointment) => void;
  onViewMyAppointments?: () => void;
  onOpenAuthModal?: (mode?: 'signin' | 'signup') => void;
}

export const AppointmentModal: React.FC<AppointmentModalProps> = ({
  isOpen,
  onClose,
  initialDoctor = null,
  initialDepartmentId = null,
  onAppointmentBooked,
  onViewMyAppointments,
  onOpenAuthModal
}) => {
  const { user, userProfile, signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();

  // Step state: 1 = Clinical Selection, 2 = Date & Slot, 3 = Patient Details & Auth, 4 = Confirmed Pass
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form states
  const [selectedDeptId, setSelectedDeptId] = useState<string>(
    initialDoctor ? initialDoctor.departmentId : (initialDepartmentId || DEPARTMENTS[0].id)
  );
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(
    initialDoctor ? initialDoctor.id : ''
  );
  const [consultationType, setConsultationType] = useState<ConsultationType>('in-person');

  // Dates
  const today = new Date();
  const getFormattedDate = (offsetDays: number) => {
    const d = new Date();
    d.setDate(today.getDate() + offsetDays);
    return d.toISOString().split('T')[0];
  };

  const [appointmentDate, setAppointmentDate] = useState<string>(getFormattedDate(1));
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');

  // Patient info
  const [patientName, setPatientName] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientAge, setPatientAge] = useState<number | ''>('');
  const [patientGender, setPatientGender] = useState<'male' | 'female' | 'other'>('female');
  const [reasonForVisit, setReasonForVisit] = useState('');
  const [medicalNotes, setMedicalNotes] = useState('');
  const [isExistingPatient, setIsExistingPatient] = useState(false);

  // Quick In-Modal Auth state if user wants to sign in or sign up before booking
  const [showAuthTab, setShowAuthTab] = useState<'none' | 'signin' | 'signup'>('none');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authErrorLocal, setAuthErrorLocal] = useState<string | null>(null);

  // Error validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-fill from authenticated user profile
  useEffect(() => {
    if (user) {
      if (userProfile?.displayName || user.displayName) {
        setPatientName(userProfile?.displayName || user.displayName || '');
      }
      if (user.email) {
        setPatientEmail(user.email);
      }
      if (userProfile?.phoneNumber || user.phoneNumber) {
        setPatientPhone(userProfile?.phoneNumber || user.phoneNumber || '');
      }
    }
  }, [user, userProfile]);

  // Synchronize when initialDoctor or initialDepartmentId changes
  useEffect(() => {
    if (initialDoctor) {
      setSelectedDeptId(initialDoctor.departmentId);
      setSelectedDoctorId(initialDoctor.id);
      if (initialDoctor.timeSlots.length > 0) {
        setSelectedTimeSlot(initialDoctor.timeSlots[0]);
      }
    } else if (initialDepartmentId) {
      setSelectedDeptId(initialDepartmentId);
      const docsInDept = DOCTORS.filter(d => d.departmentId === initialDepartmentId);
      if (docsInDept.length > 0) {
        setSelectedDoctorId(docsInDept[0].id);
        setSelectedTimeSlot(docsInDept[0].timeSlots[0] || '');
      }
    }
  }, [initialDoctor, initialDepartmentId, isOpen]);

  const filteredDoctors = DOCTORS.filter(d => d.departmentId === selectedDeptId);
  const selectedDoctor = DOCTORS.find(d => d.id === selectedDoctorId) || filteredDoctors[0];
  const selectedDepartment = DEPARTMENTS.find(d => d.id === selectedDeptId);

  useEffect(() => {
    if (filteredDoctors.length > 0 && !filteredDoctors.some(d => d.id === selectedDoctorId)) {
      setSelectedDoctorId(filteredDoctors[0].id);
      setSelectedTimeSlot(filteredDoctors[0].timeSlots[0] || '');
    }
  }, [selectedDeptId]);

  useEffect(() => {
    if (selectedDoctor && (!selectedTimeSlot || !selectedDoctor.timeSlots.includes(selectedTimeSlot))) {
      setSelectedTimeSlot(selectedDoctor.timeSlots[0] || '10:00 AM');
    }
  }, [selectedDoctorId]);

  if (!isOpen) return null;

  const validatePatientInfo = () => {
    const errs: Record<string, string> = {};
    if (!patientName.trim()) errs.patientName = 'Patient full name is required';
    if (!patientPhone.trim() || patientPhone.length < 7) errs.patientPhone = 'Valid contact phone number is required';
    if (!patientEmail.trim() || !patientEmail.includes('@')) errs.patientEmail = 'Valid email address is required for confirmation';
    if (!patientAge || Number(patientAge) <= 0 || Number(patientAge) > 120) errs.patientAge = 'Please enter a valid age (1-120)';
    if (!reasonForVisit.trim()) errs.reasonForVisit = 'Please state the primary reason for consultation';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNextFromStep1 = () => {
    if (!selectedDoctor) return;
    setStep(2);
  };

  const handleNextFromStep2 = () => {
    if (!appointmentDate || !selectedTimeSlot) {
      setErrors({ slot: 'Please select both an appointment date and a time slot.' });
      return;
    }
    setErrors({});
    setStep(3);
  };

  // Quick in-modal sign in handler
  const handleInlineSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthErrorLocal(null);
    try {
      await signInWithEmail(authEmail.trim(), authPassword);
      setShowAuthTab('none');
      setAuthLoading(false);
    } catch (err: any) {
      setAuthErrorLocal(err.message || 'Sign in failed');
      setAuthLoading(false);
    }
  };

  // Quick in-modal sign up handler
  const handleInlineSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthErrorLocal(null);
    try {
      if (!authName.trim()) {
        setAuthErrorLocal('Name is required');
        setAuthLoading(false);
        return;
      }
      await signUpWithEmail(authEmail.trim(), authPassword, authName.trim(), patientPhone);
      setShowAuthTab('none');
      setAuthLoading(false);
    } catch (err: any) {
      setAuthErrorLocal(err.message || 'Registration failed');
      setAuthLoading(false);
    }
  };

  // Quick Google sign in handler
  const handleInlineGoogle = async () => {
    setAuthLoading(true);
    setAuthErrorLocal(null);
    try {
      await signInWithGoogle();
      setShowAuthTab('none');
      setAuthLoading(false);
    } catch (err: any) {
      setAuthErrorLocal(err.message || 'Google sign-in failed');
      setAuthLoading(false);
    }
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePatientInfo()) return;
    if (!selectedDoctor || !selectedDepartment) return;

    setIsSubmitting(true);
    try {
      const newApt = await saveAppointment({
        userId: user?.uid || undefined,
        departmentId: selectedDepartment.id,
        departmentName: selectedDepartment.name,
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        doctorTitle: selectedDoctor.title,
        doctorFee: selectedDoctor.consultationFee,
        appointmentDate,
        timeSlot: selectedTimeSlot,
        consultationType,
        patientName: patientName.trim(),
        patientEmail: patientEmail.trim(),
        patientPhone: patientPhone.trim(),
        patientAge: Number(patientAge),
        patientGender,
        reasonForVisit: reasonForVisit.trim(),
        medicalNotes: medicalNotes.trim() || undefined,
        isExistingPatient,
      });

      setConfirmedAppointment(newApt);
      onAppointmentBooked(newApt);
      setIsSubmitting(false);
      setStep(4);
    } catch (err) {
      console.error('Booking submission error:', err);
      setIsSubmitting(false);
    }
  };

  const handleResetForNewBooking = () => {
    setStep(1);
    setConfirmedAppointment(null);
    setReasonForVisit('');
    setMedicalNotes('');
    setErrors({});
  };

  const dateOptions = [
    { label: 'Tomorrow', date: getFormattedDate(1) },
    { label: 'In 2 Days', date: getFormattedDate(2) },
    { label: 'In 3 Days', date: getFormattedDate(3) },
    { label: 'In 4 Days', date: getFormattedDate(4) },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div
        className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {step === 4 ? 'Appointment Confirmed' : 'Schedule a Specialist Consultation'}
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
              <span>We Care Hospitals Outpatient Center</span>
              <span aria-hidden="true">·</span>
              <span>Fast-Track Firebase Sync</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Close booking modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Progress */}
        {step < 4 && (
          <div className="px-6 pt-4 pb-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs">
            <div className={`flex items-center gap-1.5 ${step === 1 ? 'font-bold text-teal-800' : 'text-slate-500'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${step === 1 ? 'bg-teal-700 text-white' : 'bg-slate-200 text-slate-700'}`}>1</span>
              <span>Department &amp; Doctor</span>
            </div>
            <span className="text-slate-300">→</span>
            <div className={`flex items-center gap-1.5 ${step === 2 ? 'font-bold text-teal-800' : 'text-slate-500'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${step === 2 ? 'bg-teal-700 text-white' : 'bg-slate-200 text-slate-700'}`}>2</span>
              <span>Date &amp; Slot</span>
            </div>
            <span className="text-slate-300">→</span>
            <div className={`flex items-center gap-1.5 ${step === 3 ? 'font-bold text-teal-800' : 'text-slate-500'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${step === 3 ? 'bg-teal-700 text-white' : 'bg-slate-200 text-slate-700'}`}>3</span>
              <span>Patient Details &amp; Account</span>
            </div>
          </div>
        )}

        {/* Step 1: Department & Doctor */}
        {step === 1 && (
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-2">
                Consultation Format
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setConsultationType('in-person')}
                  className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-colors ${
                    consultationType === 'in-person'
                      ? 'border-teal-700 bg-teal-50/70 text-teal-950 ring-1 ring-teal-700'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <Building2 className={`w-5 h-5 mt-0.5 shrink-0 ${consultationType === 'in-person' ? 'text-teal-700' : 'text-slate-400'}`} />
                  <div>
                    <p className="text-sm font-bold">In-Person Hospital Visit</p>
                    <p className="text-xs text-slate-500">At We Care Hospitals OPD Campus</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setConsultationType('video')}
                  className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-colors ${
                    consultationType === 'video'
                      ? 'border-teal-700 bg-teal-50/70 text-teal-950 ring-1 ring-teal-700'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <Video className={`w-5 h-5 mt-0.5 shrink-0 ${consultationType === 'video' ? 'text-teal-700' : 'text-slate-400'}`} />
                  <div>
                    <p className="text-sm font-bold">Telehealth Video Consult</p>
                    <p className="text-xs text-slate-500">Secure encrypted HD consultation link</p>
                  </div>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-2">
                1. Select Clinical Department
              </label>
              <select
                value={selectedDeptId}
                onChange={(e) => setSelectedDeptId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-600 focus:border-teal-600 focus:outline-none text-slate-900"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name} ({dept.floor})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-800">
                  2. Choose Specialist Doctor ({filteredDoctors.length} available in this department)
                </label>
                <span className="text-xs text-slate-500">All board-certified</span>
              </div>

              <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                {filteredDoctors.map((doc) => {
                  const isSelected = selectedDoctorId === doc.id;
                  return (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedDoctorId(doc.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'border-teal-700 bg-teal-50/80 shadow-xs ring-1 ring-teal-700'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <DoctorAvatar doctor={doc} size="sm" />
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-slate-900">{doc.name}</p>
                            <span className="text-xs text-slate-500">({doc.qualification})</span>
                          </div>
                          <p className="text-xs text-teal-700 font-medium">{doc.title}</p>
                          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                            <span>{doc.experienceYears} Years Exp</span>
                            <span aria-hidden="true">·</span>
                            <span>{doc.roomNumber}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-slate-900 tabular-nums">৳{doc.consultationFee}</p>
                        <p className="text-xs text-emerald-700 font-medium">{doc.timeSlots.length} slots</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
              <button
                type="button"
                onClick={handleNextFromStep1}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-xl transition-colors shadow-sm"
              >
                Continue to Date &amp; Time →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Date & Slot */}
        {step === 2 && selectedDoctor && (
          <div className="p-6 space-y-6">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <DoctorAvatar doctor={selectedDoctor} size="sm" />
                <div>
                  <p className="text-xs text-slate-500">Selected Specialist</p>
                  <p className="text-sm font-bold text-slate-900">{selectedDoctor.name}</p>
                  <p className="text-xs text-teal-700">{selectedDoctor.departmentName}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs font-semibold text-teal-700 hover:underline"
              >
                Change Doctor
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-2">
                1. Select Preferred Date
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                {dateOptions.map((opt) => (
                  <button
                    key={opt.date}
                    type="button"
                    onClick={() => setAppointmentDate(opt.date)}
                    className={`p-2.5 rounded-xl border text-center transition-colors ${
                      appointmentDate === opt.date
                        ? 'border-teal-700 bg-teal-700 text-white font-bold'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs'
                    }`}
                  >
                    <p className="text-xs font-medium">{opt.label}</p>
                    <p className="text-xs tabular-nums mt-0.5 opacity-90">{opt.date}</p>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500">Or pick calendar date:</span>
                <input
                  type="date"
                  min={getFormattedDate(0)}
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-2 flex items-center justify-between">
                <span>2. Select Available Consultation Time Slot</span>
                <span className="text-slate-500 font-normal">Approx 30 mins</span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {selectedDoctor.timeSlots.map((slot) => {
                  const isSelected = selectedTimeSlot === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedTimeSlot(slot)}
                      className={`p-3 rounded-xl border text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                        isSelected
                          ? 'border-teal-700 bg-teal-700 text-white font-bold shadow-xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <Clock className="w-4 h-4 opacity-75" />
                      <span className="tabular-nums">{slot}</span>
                    </button>
                  );
                })}
              </div>
              {errors.slot && (
                <p className="text-xs text-rose-600 mt-2 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.slot}</span>
                </p>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={handleNextFromStep2}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-xl transition-colors shadow-sm"
              >
                Proceed to Patient Details →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Patient Information Form with Authentication */}
        {step === 3 && selectedDoctor && (
          <form onSubmit={handleSubmitBooking} className="p-6 space-y-5">
            {/* User Account Integration Banner */}
            {user ? (
              <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs font-bold">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-emerald-950">
                      Signed in as {userProfile?.displayName || user.displayName || user.email}
                    </p>
                    <p className="text-[11px] text-emerald-800">
                      Your appointment and medical details will be securely saved to your Firebase patient record.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-slate-800">
                    <LogIn className="w-4 h-4 text-teal-700 shrink-0" />
                    <span className="text-xs font-bold">Sign In or Create Account to Save Your Appointment</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAuthTab(showAuthTab === 'signin' ? 'none' : 'signin')}
                      className="px-3 py-1 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-lg border border-teal-200"
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAuthTab(showAuthTab === 'signup' ? 'none' : 'signup')}
                      className="px-3 py-1 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
                    >
                      Sign Up
                    </button>
                  </div>
                </div>

                {/* Inline Auth Box */}
                {showAuthTab !== 'none' && (
                  <div className="pt-3 border-t border-slate-200 space-y-3">
                    {authErrorLocal && (
                      <p className="text-xs text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200">
                        {authErrorLocal}
                      </p>
                    )}

                    {showAuthTab === 'signin' ? (
                      <div className="space-y-2">
                        <div className="grid sm:grid-cols-2 gap-2">
                          <input
                            type="email"
                            placeholder="Email address"
                            value={authEmail}
                            onChange={(e) => setAuthEmail(e.target.value)}
                            className="px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                          />
                          <input
                            type="password"
                            placeholder="Password"
                            value={authPassword}
                            onChange={(e) => setAuthPassword(e.target.value)}
                            className="px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                          />
                        </div>
                        <div className="flex items-center justify-between gap-2 pt-1">
                          <button
                            type="button"
                            onClick={handleInlineGoogle}
                            disabled={authLoading}
                            className="text-xs text-slate-700 hover:text-slate-900 font-medium"
                          >
                            Or sign in with Google
                          </button>
                          <button
                            type="button"
                            onClick={handleInlineSignIn}
                            disabled={authLoading}
                            className="px-4 py-1.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg disabled:opacity-50"
                          >
                            {authLoading ? 'Signing In...' : 'Confirm Sign In'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="grid sm:grid-cols-3 gap-2">
                          <input
                            type="text"
                            placeholder="Your full name"
                            value={authName}
                            onChange={(e) => setAuthName(e.target.value)}
                            className="px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                          />
                          <input
                            type="email"
                            placeholder="Email address"
                            value={authEmail}
                            onChange={(e) => setAuthEmail(e.target.value)}
                            className="px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                          />
                          <input
                            type="password"
                            placeholder="Create password"
                            value={authPassword}
                            onChange={(e) => setAuthPassword(e.target.value)}
                            className="px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                          />
                        </div>
                        <div className="flex items-center justify-between gap-2 pt-1">
                          <button
                            type="button"
                            onClick={handleInlineGoogle}
                            disabled={authLoading}
                            className="text-xs text-slate-700 hover:text-slate-900 font-medium"
                          >
                            Or continue with Google
                          </button>
                          <button
                            type="button"
                            onClick={handleInlineSignUp}
                            disabled={authLoading}
                            className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg disabled:opacity-50"
                          >
                            {authLoading ? 'Creating...' : 'Register Account'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Appointment summary bar */}
            <div className="bg-teal-50/70 p-3.5 rounded-xl border border-teal-200/80 text-xs text-teal-950 flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="font-bold">{selectedDoctor.name}</span>
                <span className="text-teal-800"> · {selectedDepartment?.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold tabular-nums">{appointmentDate} at {selectedTimeSlot}</span>
                <span className="font-bold tabular-nums text-slate-900">৳{selectedDoctor.consultationFee} BDT</span>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Patient Full Name *
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Margaret Sterling"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-600 focus:outline-none"
                  />
                </div>
                {errors.patientName && <p className="text-xs text-rose-600 mt-1">{errors.patientName}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Contact Phone Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +1 (555) 234-5678"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-600 focus:outline-none"
                  />
                </div>
                {errors.patientPhone && <p className="text-xs text-rose-600 mt-1">{errors.patientPhone}</p>}
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Email Address (for Firebase patient record &amp; pass) *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={patientEmail}
                    onChange={(e) => setPatientEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-600 focus:outline-none"
                  />
                </div>
                {errors.patientEmail && <p className="text-xs text-rose-600 mt-1">{errors.patientEmail}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Patient Age *
                </label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  required
                  placeholder="e.g. 42"
                  value={patientAge}
                  onChange={(e) => setPatientAge(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-600 focus:outline-none"
                />
                {errors.patientAge && <p className="text-xs text-rose-600 mt-1">{errors.patientAge}</p>}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Gender
                </label>
                <select
                  value={patientGender}
                  onChange={(e) => setPatientGender(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-600 focus:outline-none"
                >
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="other">Other / Prefer not to say</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Patient History
                </label>
                <div className="flex items-center gap-4 pt-2">
                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      checked={!isExistingPatient}
                      onChange={() => setIsExistingPatient(false)}
                      className="text-teal-700 focus:ring-teal-600"
                    />
                    <span>First-time Patient</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      checked={isExistingPatient}
                      onChange={() => setIsExistingPatient(true)}
                      className="text-teal-700 focus:ring-teal-600"
                    />
                    <span>Existing We Care Patient</span>
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Primary Reason for Consultation / Symptoms *
              </label>
              <textarea
                rows={2}
                required
                placeholder="Briefly describe your symptoms or consultation objective (e.g., chest tightness on exertion, knee pain follow-up, second opinion)..."
                value={reasonForVisit}
                onChange={(e) => setReasonForVisit(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-600 focus:outline-none"
              />
              {errors.reasonForVisit && <p className="text-xs text-rose-600 mt-1">{errors.reasonForVisit}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Medical Allergies or Notes (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Penicillin allergy, diabetic, taking blood thinners"
                value={medicalNotes}
                onChange={(e) => setMedicalNotes(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-600 focus:outline-none"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
              >
                ← Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-xl transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSubmitting ? 'Saving to Firebase...' : 'Confirm & Save Booking'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Step 4: Confirmation Pass */}
        {step === 4 && confirmedAppointment && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Your Appointment is Confirmed!</h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                Your consultation details have been recorded and saved to your patient record.
              </p>
            </div>

            {/* Printable Pass Card */}
            <div className="border border-slate-200 rounded-2xl p-6 bg-gradient-to-b from-white to-slate-50 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
                <div>
                  <span className="text-xs font-bold text-slate-900 tracking-wider">WE CARE HOSPITALS</span>
                  <p className="text-xs text-slate-500">Outpatient Consultation Pass</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Booking Reference</p>
                  <p className="text-base font-bold font-mono text-teal-800 tabular-nums">
                    #{confirmedAppointment.referenceNumber}
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-slate-500 mb-0.5">Specialist Physician</p>
                  <p className="text-sm font-bold text-slate-900">{confirmedAppointment.doctorName}</p>
                  <p className="text-slate-600">{confirmedAppointment.doctorTitle}</p>
                  <p className="text-teal-700 mt-1">{confirmedAppointment.departmentName}</p>
                </div>

                <div>
                  <p className="text-slate-500 mb-0.5">Scheduled Date &amp; Time</p>
                  <p className="text-sm font-bold text-slate-900 tabular-nums">
                    {confirmedAppointment.appointmentDate}
                  </p>
                  <p className="text-slate-700 tabular-nums font-semibold">{confirmedAppointment.timeSlot}</p>
                  <p className="text-slate-500 mt-1 capitalize">
                    Format: {confirmedAppointment.consultationType === 'in-person' ? 'In-Person Hospital OPD' : 'Telehealth Video Call'}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <p className="text-slate-500 mb-0.5">Patient Details</p>
                  <p className="font-semibold text-slate-900">{confirmedAppointment.patientName}</p>
                  <p className="text-slate-600">{confirmedAppointment.patientPhone} · {confirmedAppointment.patientEmail}</p>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <p className="text-slate-500 mb-0.5">Consultation Fee</p>
                  <p className="text-sm font-bold text-slate-900 tabular-nums">৳{confirmedAppointment.doctorFee} BDT</p>
                  <p className="text-emerald-700 font-medium">Synced with Firebase Account</p>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => downloadCalendarEvent(confirmedAppointment)}
                className="px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-xs"
              >
                <Download className="w-4 h-4 text-teal-700" />
                <span>Add to Calendar (.ics)</span>
              </button>

              {onViewMyAppointments && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onViewMyAppointments();
                  }}
                  className="px-4 py-2.5 text-xs font-semibold text-teal-800 bg-teal-50 border border-teal-200 rounded-xl hover:bg-teal-100 transition-colors flex items-center gap-2"
                >
                  <CalendarIcon className="w-4 h-4 text-teal-700" />
                  <span>View in My Appointments</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleResetForNewBooking}
                className="px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Book Another Appointment
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-sm"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
