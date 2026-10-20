import React from 'react';
import { Doctor } from '../types';
import { Stethoscope } from 'lucide-react';

interface DoctorAvatarProps {
  doctor: Doctor;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const DoctorAvatar: React.FC<DoctorAvatarProps> = ({ doctor, size = 'md' }) => {
  // Deterministic doctor badge styling based on name
  const initials = doctor.name
    .replace('Dr. ', '')
    .split(' ')
    .map(p => p[0])
    .join('')
    .substring(0, 2);

  const sizeClasses = {
    sm: 'w-10 h-10 text-xs',
    md: 'w-14 h-14 text-sm',
    lg: 'w-20 h-20 text-lg',
    xl: 'w-28 h-28 text-2xl'
  }[size];

  // Soft medical pastel gradients
  const isFemale = doctor.gender === 'female';
  const bgGradient = isFemale
    ? 'from-teal-100 to-cyan-50 text-teal-800 border-teal-200'
    : 'from-slate-100 to-sky-50 text-slate-800 border-sky-200';

  return (
    <div
      className={`${sizeClasses} rounded-2xl bg-gradient-to-br ${bgGradient} border flex flex-col items-center justify-center font-bold relative shrink-0 shadow-xs select-none`}
      aria-label={doctor.name}
    >
      <span>{initials}</span>
      <div className="absolute -bottom-1 -right-1 bg-white p-0.5 rounded-full border border-slate-200 shadow-xs">
        <Stethoscope className="w-3.5 h-3.5 text-teal-700" />
      </div>
    </div>
  );
};
