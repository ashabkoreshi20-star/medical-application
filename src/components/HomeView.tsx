import React, { useState } from 'react';
import { Department, Doctor, ActiveTab } from '../types';
import { DEPARTMENTS, DOCTORS, HOSPITAL_METRICS, HOSPITAL_AWARDS, TESTIMONIALS } from '../data/hospitalData';
import { HOSPITAL_IMAGES } from '../assets/images';
import { DepartmentIcon } from './DepartmentIcon';
import { DoctorAvatar } from './DoctorAvatar';
import {
  Calendar,
  ArrowRight,
  ShieldCheck,
  Star,
  Clock,
  Phone,
  ChevronRight,
  Sparkles,
  Users,
  Search
} from 'lucide-react';

interface HomeViewProps {
  onNavigate: (tab: ActiveTab) => void;
  onBookAppointment: (doctor?: Doctor, departmentId?: string) => void;
  onSelectDoctor: (doctor: Doctor) => void;
  onSelectDepartment: (deptId: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigate,
  onBookAppointment,
  onSelectDoctor,
  onSelectDepartment
}) => {
  // Quick booking selector widget state
  const [quickDept, setQuickDept] = useState(DEPARTMENTS[0].id);
  const [quickDoc, setQuickDoc] = useState('');

  const doctorsForQuick = DOCTORS.filter(d => d.departmentId === quickDept);

  const handleQuickBook = () => {
    const doc = DOCTORS.find(d => d.id === quickDoc) || doctorsForQuick[0];
    onBookAppointment(doc, quickDept);
  };

  // 4 Featured Doctors from various specialties
  const featuredDoctors = [
    DOCTORS.find(d => d.id === 'doc-cardio-1')!,
    DOCTORS.find(d => d.id === 'doc-neuro-1')!,
    DOCTORS.find(d => d.id === 'doc-ortho-1')!,
    DOCTORS.find(d => d.id === 'doc-ped-1')!,
  ].filter(Boolean);

  return (
    <div className="space-y-16 lg:space-y-24 pb-20">
      {/* 1. Hero Section */}
      <section className="relative pt-6 sm:pt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Proposition & CTA */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center gap-2 text-xs font-semibold text-teal-800 uppercase tracking-wider">
                <span>Welcome to We Care Hospitals</span>
                <span aria-hidden="true">·</span>
                <span>Chicago Medical District</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight [text-wrap:balance]">
                World-class medical care with compassionate clinical precision.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                We Care Hospitals unites over 20+ world-renowned clinical specialists across 8 multi-disciplinary departments. From robotic joint replacement and neurosurgery to pediatric intensive care, your health is our priority.
              </p>

              {/* Primary & Secondary Action Block */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => onBookAppointment()}
                  className="px-6 py-3.5 text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-xl transition-colors shadow-sm flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book an Appointment</span>
                </button>
                <button
                  onClick={() => onNavigate('departments')}
                  className="px-5 py-3.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <span>Explore Departments</span>
                  <ArrowRight className="w-4 h-4 text-slate-500" />
                </button>
              </div>

              {/* Quick Trust Badges */}
              <div className="flex items-center gap-6 pt-4 text-xs text-slate-500 border-t border-slate-100">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-teal-700" />
                  <span>JCI Gold Accredited</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-teal-700" />
                  <span>Same-Day OPD Slots</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-teal-700" />
                  <span>24/7 Trauma Service</span>
                </div>
              </div>
            </div>

            {/* Right Column: High-Impact Hospital Facility Visual */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl overflow-hidden border border-slate-200 shadow-xl bg-slate-100 group">
                <img
                  src={HOSPITAL_IMAGES.hero}
                  alt="We Care Hospitals Main Atrium and Medical Campus"
                  referrerPolicy="no-referrer"
                  className="w-full h-80 sm:h-96 lg:h-[460px] object-cover transition-transform duration-500 group-hover:scale-102"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/75 via-transparent to-transparent flex flex-col justify-end p-6 text-white">
                  <span className="text-xs font-semibold text-teal-300">MAIN MEDICAL PAVILION</span>
                  <p className="text-base font-bold">State-of-the-Art Healing Environment</p>
                  <p className="text-xs text-slate-200 mt-1">
                    Designed for comfort, natural light, and clinical sterility.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Adjacency Proof KPI Strip */}
          <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-4 p-6 bg-white rounded-2xl border border-slate-200 shadow-xs">
            {HOSPITAL_METRICS.map((metric, i) => (
              <div key={i} className="text-center sm:text-left sm:px-4 border-r last:border-r-0 border-slate-100">
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
                  {metric.value}
                </p>
                <p className="text-xs text-slate-500 mt-1 font-medium">{metric.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Fast-Track Consultation Finder Widget */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-lg">
          <div className="max-w-3xl mb-6">
            <span className="text-xs font-bold text-teal-400 tracking-wider uppercase">FAST-TRACK BOOKING</span>
            <h2 className="text-xl sm:text-2xl font-bold mt-1">Find a Specialist &amp; Secure Your Visit</h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Select your department and specialist to access instant appointment slots without phone queues.
            </p>
          </div>

          <div className="grid sm:grid-cols-12 gap-4 items-end">
            <div className="sm:col-span-5">
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Department
              </label>
              <select
                value={quickDept}
                onChange={(e) => {
                  setQuickDept(e.target.value);
                  setQuickDoc('');
                }}
                className="w-full px-3.5 py-3 text-sm bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {DEPARTMENTS.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-4">
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Doctor / Specialist
              </label>
              <select
                value={quickDoc}
                onChange={(e) => setQuickDoc(e.target.value)}
                className="w-full px-3.5 py-3 text-sm bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Any Available Specialist</option>
                {doctorsForQuick.map(doc => (
                  <option key={doc.id} value={doc.id}>{doc.name} ({doc.title})</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-3">
              <button
                onClick={handleQuickBook}
                className="w-full py-3 text-sm font-semibold text-slate-900 bg-teal-400 hover:bg-teal-300 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Check Slots &amp; Book</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Clinical Departments Overview (Each has multiple doctors) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-bold text-teal-800 tracking-wider uppercase">CLINICAL EXCELLENCE</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Multi-Disciplinary Departments
            </h2>
            <p className="text-sm text-slate-600 mt-1.5 max-w-xl">
              Each clinical department is headed by senior clinicians and supported by specialized doctor teams and cutting-edge surgical infrastructure.
            </p>
          </div>
          <button
            onClick={() => onNavigate('departments')}
            className="text-sm font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1.5 self-start md:self-auto"
          >
            <span>View All 8 Departments</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {DEPARTMENTS.slice(0, 6).map((dept) => {
            const doctorsInDept = DOCTORS.filter(d => d.departmentId === dept.id);
            return (
              <div
                key={dept.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-4 border border-teal-100">
                    <DepartmentIcon name={dept.iconName} className="w-6 h-6" />
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-1.5">
                    {dept.name}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    {dept.shortDescription}
                  </p>

                  <div className="space-y-2 py-3 border-t border-slate-100 text-xs">
                    <div className="flex items-center justify-between text-slate-500">
                      <span>Floor:</span>
                      <span className="font-medium text-slate-700">{dept.floor}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-500">
                      <span>Specialist Team:</span>
                      <span className="font-semibold text-teal-800">
                        {doctorsInDept.length} Specialists On-Duty
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => {
                      onSelectDepartment(dept.id);
                      onNavigate('departments');
                    }}
                    className="text-xs font-semibold text-slate-700 hover:text-teal-700 transition-colors"
                  >
                    Department Info →
                  </button>
                  <button
                    onClick={() => onBookAppointment(undefined, dept.id)}
                    className="px-3 py-1.5 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors"
                  >
                    Book in Dept
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Featured Specialist Doctors */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-bold text-teal-800 tracking-wider uppercase">MEDICAL FACULTY</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Meet Our Senior Specialists
            </h2>
            <p className="text-sm text-slate-600 mt-1.5 max-w-xl">
              Board-certified department directors and clinicians with decades of surgical experience and high patient satisfaction.
            </p>
          </div>
          <button
            onClick={() => onNavigate('doctors')}
            className="text-sm font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1.5 self-start md:self-auto"
          >
            <span>Browse All {DOCTORS.length} Doctors</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredDoctors.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <DoctorAvatar doctor={doc} size="lg" />
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-xs font-bold text-slate-900 justify-end">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="tabular-nums">{doc.rating}</span>
                    </div>
                    <span className="text-[11px] text-slate-400">({doc.reviewCount} reviews)</span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug">{doc.name}</h3>
                <p className="text-xs font-medium text-teal-700 mt-0.5">{doc.title}</p>
                <p className="text-xs text-slate-500 mt-1">{doc.departmentName}</p>

                <div className="mt-3 py-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">{doc.experienceYears} Years Exp</span>
                  <span className="font-bold text-slate-900 tabular-nums">৳{doc.consultationFee} BDT</span>
                </div>
              </div>

              <div className="pt-4 space-y-2">
                <button
                  onClick={() => onBookAppointment(doc)}
                  className="w-full py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-xl transition-colors shadow-xs"
                >
                  Book with {doc.name.split(' ')[1]}
                </button>
                <button
                  onClick={() => onSelectDoctor(doc)}
                  className="w-full py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
                >
                  View Profile &amp; Bio
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Hospital Facilities Showcase (Robotic Surgery, Consultation, MRI Diagnostics) */}
      <section className="bg-slate-100/70 py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-teal-800 tracking-wider uppercase">ADVANCED INFRASTRUCTURE</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Purpose-Built for Precision &amp; Patient Dignity
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Equipped with Da Vinci robotic surgical systems, 3 Tesla intraoperative MRI, and private consultation suites.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xs">
              <img
                src={HOSPITAL_IMAGES.surgicalSuite}
                alt="Robotic Surgical Operating Room at We Care Hospitals"
                referrerPolicy="no-referrer"
                className="w-full h-48 object-cover"
              />
              <div className="p-5">
                <h3 className="text-base font-bold text-slate-900">Robotic Surgical Theatres</h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  22 ultra-sterile operating rooms with laminar airflow and robotic da Vinci surgical systems for sub-millimeter surgical accuracy.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xs">
              <img
                src={HOSPITAL_IMAGES.diagnostics}
                alt="Diagnostic Radiology and 3T MRI Suite"
                referrerPolicy="no-referrer"
                className="w-full h-48 object-cover"
              />
              <div className="p-5">
                <h3 className="text-base font-bold text-slate-900">3T MRI &amp; Digital Diagnostics</h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Fast, high-resolution diagnostic imaging providing same-day scan interpretations and real-time intraoperative guidance.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xs">
              <img
                src={HOSPITAL_IMAGES.consultation}
                alt="Private Doctor Consultation Room"
                referrerPolicy="no-referrer"
                className="w-full h-48 object-cover"
              />
              <div className="p-5">
                <h3 className="text-base font-bold text-slate-900">Private Consultation Suites</h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Calming outpatient suites designed for confidential, unhurried physician consultations and family health planning.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Patient Testimonials & Outcomes */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-teal-800 tracking-wider uppercase">PATIENT VOICES</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Real Stories of Healing &amp; Recovery
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Every day, patients entrust their lives and well-being to our care teams. Here is what they have to say.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-3">
                  {[...Array(5)].map((_, idx) => (
                    <Star key={idx} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-slate-700 italic leading-relaxed mb-6">
                  "{t.quote}"
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <p className="text-sm font-bold text-slate-900">{t.patientName}</p>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                  <span>{t.treatment}</span>
                  <span aria-hidden="true">·</span>
                  <span>{t.doctorName}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Institutional Accreditation & Awards Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs">
          <div className="text-center max-w-xl mx-auto mb-8">
            <h3 className="text-lg font-bold text-slate-900">Hospital Certifications &amp; Quality Benchmarks</h3>
            <p className="text-xs text-slate-500 mt-1">
              Continuously audited and certified against global patient safety protocols.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOSPITAL_AWARDS.map((award, i) => (
              <div key={i} className="text-center p-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 text-teal-800 flex items-center justify-center mx-auto mb-3">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <p className="text-sm font-bold text-slate-900">{award.title}</p>
                <p className="text-xs text-slate-500 mt-1">{award.subtitle}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
