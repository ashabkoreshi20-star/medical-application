import React from 'react';
import { Doctor } from '../types';
import { X, Calendar, Clock, MapPin, GraduationCap, Award, Globe, Star } from 'lucide-react';
import { DoctorAvatar } from './DoctorAvatar';

interface DoctorDetailModalProps {
  doctor: Doctor | null;
  onClose: () => void;
  onBook: (doctor: Doctor) => void;
}

export const DoctorDetailModal: React.FC<DoctorDetailModalProps> = ({ doctor, onClose, onBook }) => {
  if (!doctor) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between">
          <div className="flex items-start gap-4">
            <DoctorAvatar doctor={doctor} size="lg" />
            <div>
              <h2 className="text-xl font-bold text-slate-900">{doctor.name}</h2>
              <p className="text-sm font-medium text-teal-700">{doctor.title}</p>
              <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                <span>{doctor.departmentName}</span>
                <span aria-hidden="true">·</span>
                <span>{doctor.qualification}</span>
                <span aria-hidden="true">·</span>
                <span>{doctor.experienceYears} Years Exp</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Key metrics bar */}
          <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
            <div>
              <p className="text-xs text-slate-500">Consultation Fee</p>
              <p className="text-base font-bold text-slate-900 tabular-nums">৳{doctor.consultationFee} BDT</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Patient Rating</p>
              <div className="flex items-center justify-center gap-1 text-base font-bold text-slate-900 tabular-nums">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{doctor.rating}</span>
                <span className="text-xs font-normal text-slate-500">({doctor.reviewCount})</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-500">OPD Location</p>
              <p className="text-xs font-semibold text-slate-800">{doctor.roomNumber}</p>
            </div>
          </div>

          {/* Biography */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-2">About the Specialist</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{doctor.bio}</p>
          </div>

          {/* Clinical Specialties */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
              <Award className="w-4 h-4 text-teal-700" />
              <span>Clinical Specialties &amp; Procedures</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {doctor.specialties.map((spec, i) => (
                <span
                  key={i}
                  className="text-xs bg-slate-100 text-slate-800 px-2.5 py-1 rounded-md border border-slate-200"
                >
                  {spec}
                </span>
              ))}
            </div>
          </div>

          {/* Education & Fellowships */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-teal-700" />
              <span>Medical Education &amp; Credentials</span>
            </h3>
            <ul className="space-y-1.5 text-xs text-slate-600">
              {doctor.education.map((edu, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-600 shrink-0" />
                  <span>{edu}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Languages & Schedule */}
          <div className="grid sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 text-xs">
            <div>
              <p className="font-semibold text-slate-900 mb-1 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-slate-500" />
                <span>Consultation Languages</span>
              </p>
              <p className="text-slate-600">{doctor.languages.join(', ')}</p>
            </div>
            <div>
              <p className="font-semibold text-slate-900 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Available Clinic Days</span>
              </p>
              <p className="text-slate-600">{doctor.availabilityDays.join(', ')}</p>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-4">
          <div className="text-xs text-slate-500">
            <span>Next Available Slot: </span>
            <span className="font-semibold text-slate-800">{doctor.timeSlots[0]}</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onBook(doctor);
              }}
              className="px-5 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Book Appointment with {doctor.name.split(' ').slice(0, 2).join(' ')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
