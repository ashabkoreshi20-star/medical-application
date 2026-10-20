import React from 'react';
import { ActiveTab } from '../types';
import { DEPARTMENTS } from '../data/hospitalData';
import { Phone, MapPin, Mail, Clock, ShieldCheck, Heart } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: ActiveTab) => void;
  onBookAppointment: () => void;
  onSelectDepartment: (deptId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onBookAppointment,
  onSelectDepartment
}) => {
  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          {/* Brand & Mission */}
          <div className="lg:col-span-4 space-y-4">
            <h3 className="text-xl font-bold tracking-tight text-white">We Care Hospitals</h3>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              We Care Hospitals is a premier 450-bed quaternary medical institution dedicated to advanced surgical excellence, multi-disciplinary patient care, and continuous clinical innovation.
            </p>
            <div className="pt-2 space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-teal-400 shrink-0" />
                <span>800 Mercy Avenue, Chicago Medical District, IL 60612</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Emergency: 1-800-932-2731 · OPD: +1 (555) 019-2834</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-teal-400 shrink-0" />
                <span>care@wecarehospitals.org</span>
              </div>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div className="lg:col-span-2 space-y-3">
            <p className="text-xs font-bold text-white uppercase tracking-wider">Hospital</p>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-white transition-colors text-left"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-white transition-colors text-left"
                >
                  About Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('departments')}
                  className="hover:text-white transition-colors text-left"
                >
                  Departments
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('doctors')}
                  className="hover:text-white transition-colors text-left"
                >
                  Find Doctors
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('my-appointments')}
                  className="hover:text-white transition-colors text-left"
                >
                  My Appointments
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('signin')}
                  className="hover:text-white transition-colors text-left"
                >
                  Patient Sign In / Register
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('account')}
                  className="hover:text-white transition-colors text-left"
                >
                  Account &amp; Sign Out
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('admin')}
                  className="text-teal-300 hover:text-white transition-colors text-left flex items-center gap-1"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                  <span>Admin Management Portal</span>
                </button>
              </li>
              <li>
                <button
                  onClick={onBookAppointment}
                  className="text-teal-400 font-semibold hover:underline text-left"
                >
                  Book Consultation
                </button>
              </li>
            </ul>
          </div>

          {/* Clinical Departments Links */}
          <div className="lg:col-span-3 space-y-3">
            <p className="text-xs font-bold text-white uppercase tracking-wider">Clinical Institutes</p>
            <ul className="space-y-1.5 text-xs text-slate-400">
              {DEPARTMENTS.slice(0, 6).map((dept) => (
                <li key={dept.id}>
                  <button
                    onClick={() => {
                      onSelectDepartment(dept.id);
                      onNavigate('departments');
                    }}
                    className="hover:text-white transition-colors text-left truncate max-w-full"
                  >
                    {dept.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Emergency & Visiting Hours */}
          <div className="lg:col-span-3 space-y-3">
            <p className="text-xs font-bold text-white uppercase tracking-wider">Patient Information</p>
            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 text-rose-400 font-bold">
                <Clock className="w-4 h-4" />
                <span>Emergency 24/7/365</span>
              </div>
              <p className="text-slate-400">
                General Visiting Hours: Daily 10:00 AM – 8:00 PM. ICU restricted to immediate family.
              </p>
              <div className="pt-2 border-t border-slate-800 flex items-center gap-1.5 text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                <span>Accredited by JCI &amp; Magnet Nursing</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 We Care Hospitals. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Patient Privacy &amp; HIPAA</span>
            <span>Clinical Governance</span>
            <span>Non-Discrimination Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
