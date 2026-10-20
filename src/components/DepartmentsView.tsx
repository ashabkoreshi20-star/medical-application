import React, { useState } from 'react';
import { Department, Doctor } from '../types';
import { DEPARTMENTS, DOCTORS } from '../data/hospitalData';
import { DepartmentIcon } from './DepartmentIcon';
import { DoctorAvatar } from './DoctorAvatar';
import {
  Calendar,
  MapPin,
  UserCheck,
  CheckCircle2,
  Cpu,
  Star,
  Users,
  Search,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

interface DepartmentsViewProps {
  onBookAppointment: (doctor?: Doctor, departmentId?: string) => void;
  onSelectDoctor: (doctor: Doctor) => void;
  selectedDepartmentId?: string | null;
}

export const DepartmentsView: React.FC<DepartmentsViewProps> = ({
  onBookAppointment,
  onSelectDoctor,
  selectedDepartmentId = null
}) => {
  const [activeDeptId, setActiveDeptId] = useState<string>(
    selectedDepartmentId || DEPARTMENTS[0].id
  );
  const [searchQuery, setSearchQuery] = useState('');

  const activeDepartment = DEPARTMENTS.find(d => d.id === activeDeptId) || DEPARTMENTS[0];
  const doctorsInActiveDept = DOCTORS.filter(d => d.departmentId === activeDepartment.id);

  // Search filtered departments
  const filteredDepartments = DEPARTMENTS.filter(dept =>
    dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dept.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dept.services.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-12 pb-20">
      {/* 1. Header Banner */}
      <section className="bg-white border-b border-slate-200 py-10 lg:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="text-xs font-bold text-teal-800 tracking-wider uppercase">CLINICAL DIRECTORY</span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2 tracking-tight [text-wrap:balance]">
              Specialized Medical Departments
            </h1>
            <p className="text-base text-slate-600 mt-3 leading-relaxed">
              We Care Hospitals operates 8 clinical institutes. Each department houses dedicated diagnostic technology, surgical infrastructure, and multiple board-certified specialists ready to care for you.
            </p>
          </div>

          {/* Search bar */}
          <div className="mt-6 max-w-md relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search departments, treatments, or procedures..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-600 focus:outline-none"
            />
          </div>
        </div>
      </section>

      {/* 2. Main Department Browser */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Department List Sidebar / Selector */}
          <div className="lg:col-span-4 space-y-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider px-2 mb-1">
              Select Department ({filteredDepartments.length})
            </p>
            <div className="space-y-2">
              {filteredDepartments.map((dept) => {
                const isSelected = dept.id === activeDepartment.id;
                const docCount = DOCTORS.filter(d => d.departmentId === dept.id).length;
                return (
                  <button
                    key={dept.id}
                    onClick={() => setActiveDeptId(dept.id)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                      isSelected
                        ? 'border-teal-700 bg-teal-50/80 shadow-xs ring-1 ring-teal-700'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <DepartmentIcon name={dept.iconName} className="w-5 h-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-sm font-bold truncate ${isSelected ? 'text-teal-950' : 'text-slate-900'}`}>
                          {dept.name}
                        </p>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                        {dept.shortDescription}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500">
                        <span className="font-semibold text-teal-800">{docCount} Specialists</span>
                        <span aria-hidden="true">·</span>
                        <span>{dept.floor}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Department Active Detail Panel */}
          <div className="lg:col-span-8 space-y-8">
            {/* Department Marquee Banner */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-100">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-teal-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <DepartmentIcon name={activeDepartment.iconName} className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-extrabold text-slate-900">{activeDepartment.name}</h2>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{activeDepartment.floor}</span>
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                        <span>HOD: {activeDepartment.headOfDepartment}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onBookAppointment(undefined, activeDepartment.id)}
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-xl transition-colors shadow-sm shrink-0 flex items-center gap-2 self-start"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book in This Department</span>
                </button>
              </div>

              {/* Department Overview */}
              <div className="py-6 border-b border-slate-100 space-y-3">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-xs">
                  Clinical Overview &amp; Scope
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {activeDepartment.fullDescription}
                </p>
                <p className="text-xs font-medium text-teal-800">
                  {activeDepartment.patientCountServed}
                </p>
              </div>

              {/* Core Services & Key Technologies */}
              <div className="grid sm:grid-cols-2 gap-6 pt-6">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-teal-700" />
                    <span>Specialized Procedures &amp; Care</span>
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-600">
                    {activeDepartment.services.map((svc, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-600 mt-1.5 shrink-0" />
                        <span>{svc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-teal-700" />
                    <span>Advanced Technology &amp; Devices</span>
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-600">
                    {activeDepartment.keyTechnologies.map((tech, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-600 mt-1.5 shrink-0" />
                        <span>{tech}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Department Doctors Section (Multiple doctors in this department) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Specialist Doctors in {activeDepartment.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {doctorsInActiveDept.length} certified clinicians currently practicing in this department
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {doctorsInActiveDept.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <DoctorAvatar doctor={doc} size="md" />
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-xs font-bold text-slate-900 justify-end">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span className="tabular-nums">{doc.rating}</span>
                          </div>
                          <p className="text-[11px] text-slate-500">({doc.reviewCount} reviews)</p>
                        </div>
                      </div>

                      <h4 className="text-base font-bold text-slate-900">{doc.name}</h4>
                      <p className="text-xs font-semibold text-teal-700 mt-0.5">{doc.title}</p>
                      <p className="text-xs text-slate-500 mt-1">{doc.qualification}</p>

                      <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed">
                        {doc.bio}
                      </p>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-500">{doc.experienceYears} Years Exp</span>
                        <span className="font-bold text-slate-900 tabular-nums">৳{doc.consultationFee} BDT</span>
                      </div>
                    </div>

                    <div className="pt-4 space-y-2">
                      <button
                        onClick={() => onBookAppointment(doc, activeDepartment.id)}
                        className="w-full py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-xl transition-colors shadow-xs flex items-center justify-center gap-1.5"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Book with {doc.name.split(' ')[1]}</span>
                      </button>
                      <button
                        onClick={() => onSelectDoctor(doc)}
                        className="w-full py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
                      >
                        View Full Credentials &amp; Schedule
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
