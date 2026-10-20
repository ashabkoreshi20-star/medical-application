import React, { useState, useEffect, useCallback } from 'react';
import { ActiveTab, Doctor, Appointment } from './types';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TopEmergencyStrip } from './components/TopEmergencyStrip';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomeView } from './components/HomeView';
import { AboutView } from './components/AboutView';
import { DepartmentsView } from './components/DepartmentsView';
import { DoctorsView } from './components/DoctorsView';
import { MyAppointmentsView } from './components/MyAppointmentsView';
import { SignInPage } from './components/SignInPage';
import { AccountPage } from './components/AccountPage';
import { AdminPortalView } from './components/AdminPortalView';
import { AppointmentModal } from './components/AppointmentModal';
import { DoctorDetailModal } from './components/DoctorDetailModal';
import { fetchUserAppointments, getLocalAppointments } from './utils/appointmentStorage';

function MainApp() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [appointments, setAppointments] = useState<Appointment[]>(getLocalAppointments());

  // Modal states
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingPreselectedDoctor, setBookingPreselectedDoctor] = useState<Doctor | null>(null);
  const [bookingPreselectedDeptId, setBookingPreselectedDeptId] = useState<string | null>(null);

  const [detailDoctor, setDetailDoctor] = useState<Doctor | null>(null);
  const [selectedDeptIdForView, setSelectedDeptIdForView] = useState<string | null>(null);

  // Load appointments when user auth state changes or on refresh
  const refreshAppointments = useCallback(async () => {
    const list = await fetchUserAppointments(user?.uid);
    setAppointments(list);
  }, [user]);

  useEffect(() => {
    refreshAppointments();
  }, [refreshAppointments]);

  const handleOpenBooking = (doctor?: Doctor, departmentId?: string) => {
    setBookingPreselectedDoctor(doctor || null);
    setBookingPreselectedDeptId(departmentId || (doctor ? doctor.departmentId : null));
    setIsBookingOpen(true);
  };

  const handleCloseBooking = () => {
    setIsBookingOpen(false);
    setBookingPreselectedDoctor(null);
    setBookingPreselectedDeptId(null);
  };

  const handleAppointmentBooked = (_newAppointment: Appointment) => {
    refreshAppointments();
  };

  const handleNavigate = (tab: ActiveTab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeConfirmedBookingsCount = appointments.filter(a => a.status === 'confirmed').length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* 24/7 Emergency and Trauma Banner */}
      <TopEmergencyStrip onNavigate={handleNavigate} />

      {/* Top Bar Navigation with dedicated links to Sign In and Account & Sign Out */}
      <Header
        activeTab={activeTab}
        setActiveTab={handleNavigate}
        onOpenBooking={() => handleOpenBooking()}
        bookingCount={activeConfirmedBookingsCount}
      />

      {/* Main Page Content Body */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <HomeView
            onNavigate={handleNavigate}
            onBookAppointment={handleOpenBooking}
            onSelectDoctor={(doc) => setDetailDoctor(doc)}
            onSelectDepartment={(deptId) => {
              setSelectedDeptIdForView(deptId);
              setActiveTab('departments');
            }}
          />
        )}

        {activeTab === 'about' && (
          <AboutView
            onBookAppointment={() => handleOpenBooking()}
            onExploreDepartments={() => handleNavigate('departments')}
          />
        )}

        {activeTab === 'departments' && (
          <DepartmentsView
            onBookAppointment={handleOpenBooking}
            onSelectDoctor={(doc) => setDetailDoctor(doc)}
            selectedDepartmentId={selectedDeptIdForView}
          />
        )}

        {activeTab === 'doctors' && (
          <DoctorsView
            onBookAppointment={(doc) => handleOpenBooking(doc)}
            onSelectDoctor={(doc) => setDetailDoctor(doc)}
          />
        )}

        {activeTab === 'my-appointments' && (
          <MyAppointmentsView
            appointments={appointments}
            onRefresh={refreshAppointments}
            onBookNew={() => handleOpenBooking()}
            onOpenAuth={() => handleNavigate('signin')}
          />
        )}

        {activeTab === 'signin' && (
          <SignInPage
            onNavigate={handleNavigate}
            onBookAppointment={() => handleOpenBooking()}
          />
        )}

        {activeTab === 'account' && (
          <AccountPage
            onNavigate={handleNavigate}
            appointments={appointments}
            onBookAppointment={() => handleOpenBooking()}
            onRefreshAppointments={refreshAppointments}
          />
        )}

        {activeTab === 'admin' && (
          <AdminPortalView
            onNavigate={handleNavigate}
          />
        )}
      </main>

      {/* Hospital Footer */}
      <Footer
        onNavigate={handleNavigate}
        onBookAppointment={() => handleOpenBooking()}
        onSelectDepartment={(deptId) => {
          setSelectedDeptIdForView(deptId);
          handleNavigate('departments');
        }}
      />

      {/* Appointment Booking Modal */}
      <AppointmentModal
        isOpen={isBookingOpen}
        onClose={handleCloseBooking}
        initialDoctor={bookingPreselectedDoctor}
        initialDepartmentId={bookingPreselectedDeptId}
        onAppointmentBooked={handleAppointmentBooked}
        onViewMyAppointments={() => {
          handleCloseBooking();
          setActiveTab('my-appointments');
        }}
      />

      {/* Doctor Credentials & Bio Detail Modal */}
      <DoctorDetailModal
        doctor={detailDoctor}
        onClose={() => setDetailDoctor(null)}
        onBook={(doc) => {
          setDetailDoctor(null);
          handleOpenBooking(doc);
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
