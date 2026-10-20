import React, { useState, useMemo } from 'react';
import { Doctor } from '../types';
import { DEPARTMENTS, DOCTORS } from '../data/hospitalData';
import { DoctorAvatar } from './DoctorAvatar';
import {
  Calendar,
  Search,
  Star,
  MapPin,
  Clock,
  Globe,
  SlidersHorizontal,
  GraduationCap
} from 'lucide-react';

interface DoctorsViewProps {
  onBookAppointment: (doctor: Doctor) => void;
  onSelectDoctor: (doctor: Doctor) => void;
}

export const DoctorsView: React.FC<DoctorsViewProps> = ({
  onBookAppointment,
  onSelectDoctor
}) => {
  const [selectedDeptId, setSelectedDeptId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'rating' | 'experience' | 'fee-low' | 'fee-high'>('rating');

  const filteredDoctors = useMemo(() => {
    return DOCTORS.filter((doc) => {
      // Department filter
      if (selectedDeptId !== 'all' && doc.departmentId !== selectedDeptId) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = doc.name.toLowerCase().includes(query);
        const matchesTitle = doc.title.toLowerCase().includes(query);
        const matchesDept = doc.departmentName.toLowerCase().includes(query);
        const matchesSpecialty = doc.specialties.some(s => s.toLowerCase().includes(query));
        const matchesLang = doc.languages.some(l => l.toLowerCase().includes(query));
        if (!matchesName && !matchesTitle && !matchesDept && !matchesSpecialty && !matchesLang) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'experience') return b.experienceYears - a.experienceYears;
      if (sortBy === 'fee-low') return a.consultationFee - b.consultationFee;
      if (sortBy === 'fee-high') return b.consultationFee - a.consultationFee;
      return 0;
    });
  }, [selectedDeptId, searchQuery, sortBy]);

  return (
    <div className="space-y-10 pb-20">
      {/* 1. Header Banner */}
      <section className="bg-white border-b border-slate-200 py-10 lg:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="text-xs font-bold text-teal-800 tracking-wider uppercase">MEDICAL DIRECTORY</span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2 tracking-tight [text-wrap:balance]">
              Our Medical Specialists &amp; Surgeons
            </h1>
            <p className="text-base text-slate-600 mt-3 leading-relaxed">
              Every clinician at We Care Hospitals holds extensive post-graduate qualifications, international fellowship training, and a dedication to patient-first medical outcomes.
            </p>
          </div>

          {/* Search & Sort Controls */}
          <div className="mt-8 grid sm:grid-cols-12 gap-4 items-center">
            <div className="sm:col-span-8 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search by doctor name, specialty (e.g. angioplasty, pediatric, spine), or language..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-600 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-4 flex items-center gap-2">
              <span className="text-xs text-slate-500 whitespace-nowrap">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600"
              >
                <option value="rating">Highest Patient Rating</option>
                <option value="experience">Most Years of Experience</option>
                <option value="fee-low">Fee: Low to High</option>
                <option value="fee-high">Fee: High to Low</option>
              </select>
            </div>
          </div>

          {/* Department Filter Bar (Functional segmented buttons) */}
          <div className="mt-6 flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none text-xs">
            <button
              onClick={() => setSelectedDeptId('all')}
              className={`px-3.5 py-2 rounded-xl font-medium whitespace-nowrap transition-colors ${
                selectedDeptId === 'all'
                  ? 'bg-teal-700 text-white font-semibold shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All Specialties ({DOCTORS.length})
            </button>
            {DEPARTMENTS.map((dept) => {
              const count = DOCTORS.filter(d => d.departmentId === dept.id).length;
              const isSelected = selectedDeptId === dept.id;
              return (
                <button
                  key={dept.id}
                  onClick={() => setSelectedDeptId(dept.id)}
                  className={`px-3.5 py-2 rounded-xl font-medium whitespace-nowrap transition-colors ${
                    isSelected
                      ? 'bg-teal-700 text-white font-semibold shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {dept.name.split(' ')[0]} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 2. Doctors Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Showing {filteredDoctors.length} {filteredDoctors.length === 1 ? 'Doctor' : 'Doctors'}
          </p>
          {selectedDeptId !== 'all' && (
            <button
              onClick={() => setSelectedDeptId('all')}
              className="text-xs font-semibold text-teal-700 hover:underline"
            >
              Reset Department Filter
            </button>
          )}
        </div>

        {filteredDoctors.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-3">
            <p className="text-base font-bold text-slate-800">No doctors match your search</p>
            <p className="text-xs text-slate-500">
              Try adjusting your search terms or selecting "All Specialties" to view all hospital physicians.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedDeptId('all');
              }}
              className="px-4 py-2 text-xs font-semibold text-teal-800 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  {/* Top card row: Avatar & Rating */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <DoctorAvatar doctor={doc} size="lg" />
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-xs font-bold text-slate-900 justify-end">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="tabular-nums">{doc.rating}</span>
                      </div>
                      <p className="text-[11px] text-slate-400">({doc.reviewCount} reviews)</p>
                    </div>
                  </div>

                  {/* Title & Qualifications */}
                  <h3 className="text-lg font-bold text-slate-900 leading-snug">{doc.name}</h3>
                  <p className="text-xs font-semibold text-teal-700 mt-0.5">{doc.title}</p>
                  <p className="text-xs text-slate-500 mt-1">{doc.departmentName}</p>

                  <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                    <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{doc.qualification}</span>
                  </div>

                  {/* Bio snippet */}
                  <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed">
                    {doc.bio}
                  </p>

                  {/* Specialties tags */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {doc.specialties.slice(0, 2).map((spec, i) => (
                      <span
                        key={i}
                        className="text-[11px] bg-slate-50 text-slate-700 px-2 py-0.5 rounded border border-slate-200"
                      >
                        {spec}
                      </span>
                    ))}
                    {doc.specialties.length > 2 && (
                      <span className="text-[11px] text-slate-400 px-1 py-0.5">
                        +{doc.specialties.length - 2} more
                      </span>
                    )}
                  </div>

                  {/* Key metadata strip */}
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-500">
                    <div className="flex items-center justify-between">
                      <span>Experience:</span>
                      <span className="font-medium text-slate-800">{doc.experienceYears} Years</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Clinic Location:</span>
                      <span className="font-medium text-slate-800">{doc.roomNumber}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Consultation Fee:</span>
                      <span className="font-bold text-slate-900 tabular-nums">৳{doc.consultationFee} BDT</span>
                    </div>
                  </div>
                </div>

                {/* Bottom actions */}
                <div className="pt-4 border-t border-slate-100 space-y-2 mt-4">
                  <button
                    onClick={() => onBookAppointment(doc)}
                    className="w-full py-2.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-xl transition-colors shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Book with {doc.name.split(' ').slice(0, 2).join(' ')}</span>
                  </button>
                  <button
                    onClick={() => onSelectDoctor(doc)}
                    className="w-full py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    View Credentials &amp; Bio
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
