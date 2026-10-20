import React from 'react';
import { Phone, Clock, MapPin, ShieldCheck, Shield } from 'lucide-react';
import { ActiveTab } from '../types';

interface TopEmergencyStripProps {
  onNavigate?: (tab: ActiveTab) => void;
}

export const TopEmergencyStrip: React.FC<TopEmergencyStripProps> = ({ onNavigate }) => {
  return (
    <div className="bg-slate-900 text-slate-200 text-xs border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap items-center justify-between gap-y-2 gap-x-6">
        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-1.5 text-rose-300 font-medium">
            <Phone className="w-3.5 h-3.5" />
            <span>24/7 Trauma Hotline:</span>
            <a href="tel:+18009322731" className="text-white hover:underline font-mono font-semibold">
              1-800-932-2731
            </a>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-slate-300">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Outpatient OPD: Mon – Sat, 8:00 AM – 8:00 PM</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-slate-300">
          <div className="hidden md:flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>800 Mercy Avenue, Chicago Medical Center</span>
          </div>
          <span className="hidden md:inline text-slate-600">|</span>
          <div className="flex items-center gap-1 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>JCI Accredited</span>
          </div>
          {onNavigate && (
            <>
              <span className="hidden lg:inline text-slate-600">|</span>
              <button
                onClick={() => onNavigate('admin')}
                className="hidden lg:flex items-center gap-1 text-slate-400 hover:text-teal-300 transition-colors"
                title="Hospital Administration Portal"
              >
                <Shield className="w-3.5 h-3.5 text-teal-400" />
                <span>Admin Portal</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
