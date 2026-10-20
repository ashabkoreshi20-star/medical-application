export interface Doctor {
  id: string;
  name: string;
  title: string;
  departmentId: string;
  departmentName: string;
  qualification: string;
  experienceYears: number;
  consultationFee: number;
  rating: number;
  reviewCount: number;
  avatarSeed: string;
  gender: 'female' | 'male';
  languages: string[];
  bio: string;
  education: string[];
  specialties: string[];
  roomNumber: string;
  availabilityDays: string[];
  timeSlots: string[];
}

export interface Department {
  id: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  iconName: string;
  floor: string;
  headOfDepartment: string;
  services: string[];
  keyTechnologies: string[];
  patientCountServed: string;
  featuredProcedures: string[];
}

export type ConsultationType = 'in-person' | 'video';

export interface Appointment {
  id: string;
  userId?: string;
  referenceNumber: string;
  departmentId: string;
  departmentName: string;
  doctorId: string;
  doctorName: string;
  doctorTitle: string;
  doctorFee: number;
  appointmentDate: string;
  timeSlot: string;
  consultationType: ConsultationType;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  patientAge: number;
  patientGender: 'male' | 'female' | 'other';
  reasonForVisit: string;
  medicalNotes?: string;
  isExistingPatient: boolean;
  status: 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface Testimonial {
  id: string;
  patientName: string;
  patientCity: string;
  treatment: string;
  doctorName: string;
  departmentName: string;
  quote: string;
  rating: number;
  date: string;
}

export type ActiveTab = 'home' | 'about' | 'departments' | 'doctors' | 'my-appointments' | 'signin' | 'account' | 'admin';
