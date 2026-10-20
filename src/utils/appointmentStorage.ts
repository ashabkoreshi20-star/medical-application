import { Appointment } from '../types';
import { INITIAL_SAMPLE_APPOINTMENTS } from '../data/hospitalData';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';

const STORAGE_KEY = 'we_care_hospitals_appointments_v1';

export function getLocalAppointments(): Appointment[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SAMPLE_APPOINTMENTS));
      return INITIAL_SAMPLE_APPOINTMENTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_SAMPLE_APPOINTMENTS;
  } catch (e) {
    console.error('Failed to parse appointments from localStorage:', e);
    return INITIAL_SAMPLE_APPOINTMENTS;
  }
}

export function saveLocalAppointments(appointments: Appointment[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

/**
 * Fetch appointments for a user: tries Firestore first, merges with local cache
 */
export async function fetchUserAppointments(userId?: string | null): Promise<Appointment[]> {
  const localList = getLocalAppointments();

  if (!userId) {
    return localList;
  }

  try {
    const colRef = collection(db, 'appointments');
    const q = query(colRef, where('userId', '==', userId));
    const snap = await getDocs(q);

    const firestoreList: Appointment[] = [];
    snap.forEach((d) => {
      firestoreList.push(d.data() as Appointment);
    });

    if (firestoreList.length > 0) {
      // Merge with any local list that matches
      const combined = [...firestoreList];
      for (const loc of localList) {
        if (!combined.some(c => c.id === loc.id) && loc.userId === userId) {
          combined.push(loc);
        }
      }
      saveLocalAppointments(combined);
      return combined;
    }
    return localList.filter(a => !a.userId || a.userId === userId);
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'appointments');
    return localList.filter(a => !a.userId || a.userId === userId);
  }
}

/**
 * Save new appointment to Firestore and localStorage
 */
export async function saveAppointment(
  appointment: Omit<Appointment, 'id' | 'referenceNumber' | 'createdAt' | 'status'>
): Promise<Appointment> {
  const current = getLocalAppointments();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const newAppointment: Appointment = {
    ...appointment,
    id: `apt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    referenceNumber: `WCH-${randomSuffix}`,
    status: 'confirmed',
    createdAt: new Date().toISOString()
  };

  // 1. Save locally
  const updated = [newAppointment, ...current];
  saveLocalAppointments(updated);

  // 2. Persist to Firestore
  try {
    const docRef = doc(db, 'appointments', newAppointment.id);
    await setDoc(docRef, newAppointment);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `appointments/${newAppointment.id}`);
  }

  return newAppointment;
}

/**
 * Update appointment status (e.g. cancelled) in Firestore and local
 */
export async function updateAppointmentStatus(id: string, status: 'confirmed' | 'completed' | 'cancelled'): Promise<Appointment[]> {
  const current = getLocalAppointments();
  const updated = current.map(item => item.id === id ? { ...item, status } : item);
  saveLocalAppointments(updated);

  try {
    const docRef = doc(db, 'appointments', id);
    await updateDoc(docRef, { status });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `appointments/${id}`);
  }

  return updated;
}

/**
 * Reschedule appointment in Firestore and local
 */
export async function rescheduleAppointment(id: string, newDate: string, newTimeSlot: string): Promise<Appointment[]> {
  const current = getLocalAppointments();
  const updated = current.map(item => item.id === id ? { ...item, appointmentDate: newDate, timeSlot: newTimeSlot, status: 'confirmed' as const } : item);
  saveLocalAppointments(updated);

  try {
    const docRef = doc(db, 'appointments', id);
    await updateDoc(docRef, {
      appointmentDate: newDate,
      timeSlot: newTimeSlot,
      status: 'confirmed'
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `appointments/${id}`);
  }

  return updated;
}

/**
 * Fetch ALL hospital appointments for Admin Portal (Firestore + localStorage)
 */
export async function fetchAllAppointmentsAdmin(): Promise<Appointment[]> {
  const localList = getLocalAppointments();

  try {
    const colRef = collection(db, 'appointments');
    const snap = await getDocs(colRef);

    const firestoreList: Appointment[] = [];
    snap.forEach((d) => {
      firestoreList.push(d.data() as Appointment);
    });

    // Merge by id
    const map = new Map<string, Appointment>();
    // First insert local
    for (const item of localList) {
      map.set(item.id, item);
    }
    // Then override/add with Firestore data
    for (const item of firestoreList) {
      map.set(item.id, item);
    }

    const merged = Array.from(map.values()).sort((a, b) => {
      const dateA = new Date(a.createdAt || a.appointmentDate).getTime();
      const dateB = new Date(b.createdAt || b.appointmentDate).getTime();
      return dateB - dateA;
    });

    saveLocalAppointments(merged);
    return merged;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'appointments');
    return localList.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.appointmentDate).getTime();
      const dateB = new Date(b.createdAt || b.appointmentDate).getTime();
      return dateB - dateA;
    });
  }
}

/**
 * Add a new booking from the Admin Terminal
 */
export async function saveAppointmentByAdmin(
  bookingData: Omit<Appointment, 'id' | 'referenceNumber' | 'createdAt'>
): Promise<Appointment> {
  const current = getLocalAppointments();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const newAppointment: Appointment = {
    ...bookingData,
    id: `apt-adm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    referenceNumber: `WCH-${randomSuffix}`,
    createdAt: new Date().toISOString()
  };

  // 1. Save locally
  const updated = [newAppointment, ...current];
  saveLocalAppointments(updated);

  // 2. Persist to Firestore
  try {
    const docRef = doc(db, 'appointments', newAppointment.id);
    await setDoc(docRef, newAppointment);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `appointments/${newAppointment.id}`);
  }

  return newAppointment;
}

/**
 * Update full appointment details by Admin (date, time, doctor, status, notes)
 */
export async function updateAppointmentDetailsByAdmin(
  id: string,
  updates: Partial<Appointment>
): Promise<Appointment[]> {
  const current = getLocalAppointments();
  const updated = current.map((item) => (item.id === id ? { ...item, ...updates } : item));
  saveLocalAppointments(updated);

  try {
    const docRef = doc(db, 'appointments', id);
    await updateDoc(docRef, updates as any);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `appointments/${id}`);
  }

  return updated;
}

/**
 * Delete booking permanently from Admin console
 */
export async function deleteAppointmentByAdmin(id: string): Promise<Appointment[]> {
  const current = getLocalAppointments();
  const filtered = current.filter((item) => item.id !== id);
  saveLocalAppointments(filtered);

  try {
    const docRef = doc(db, 'appointments', id);
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `appointments/${id}`);
  }

  return filtered;
}

export function generateCalendarICS(appointment: Appointment): string {
  const [hoursStr, rest] = appointment.timeSlot.split(':');
  const [minutesStr, ampm] = rest.split(' ');
  let hours = parseInt(hoursStr, 10);
  if (ampm === 'PM' && hours < 12) hours += 12;
  if (ampm === 'AM' && hours === 12) hours = 0;

  const dateParts = appointment.appointmentDate.split('-');
  const year = dateParts[0];
  const month = dateParts[1].padStart(2, '0');
  const day = dateParts[2].padStart(2, '0');

  const startHour = String(hours).padStart(2, '0');
  const startMin = minutesStr.padStart(2, '0');
  const endHour = String((hours + 1) % 24).padStart(2, '0');

  const dtStart = `${year}${month}${day}T${startHour}${startMin}00`;
  const dtEnd = `${year}${month}${day}T${endHour}${startMin}00`;

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//We Care Hospitals//Appointment Scheduler//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `SUMMARY:Medical Consultation with ${appointment.doctorName} (${appointment.departmentName})`,
    `DESCRIPTION:We Care Hospitals Appointment. Ref: ${appointment.referenceNumber}. Type: ${appointment.consultationType.toUpperCase()}. Patient: ${appointment.patientName}.`,
    `LOCATION:We Care Hospitals, Main Campus, 800 Mercy Avenue, Chicago, IL`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `STATUS:CONFIRMED`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
}

export function downloadCalendarEvent(appointment: Appointment) {
  const icsData = generateCalendarICS(appointment);
  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `appointment-${appointment.referenceNumber}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
