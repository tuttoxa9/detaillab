import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAt,
  endAt,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type {
  Employee,
  Organization,
  WorkLog,
  CarWashed,
  Appointment,
  Settings,
} from '@/types';

// Collections
const COLLECTIONS = {
  EMPLOYEES: 'employees',
  ORGANIZATIONS: 'organizations',
  WORKLOGS: 'worklogs',
  CARS_WASHED: 'carsWashed',
  APPOINTMENTS: 'appointments',
  SETTINGS: 'settings',
} as const;

// Employees
export const getEmployees = async (): Promise<Employee[]> => {
  const querySnapshot = await getDocs(
    query(collection(db, COLLECTIONS.EMPLOYEES), orderBy('name'))
  );
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
  })) as Employee[];
};

export const addEmployee = async (name: string): Promise<string> => {
  const docRef = await addDoc(collection(db, COLLECTIONS.EMPLOYEES), {
    name,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
};

export const updateEmployee = async (id: string, name: string): Promise<void> => {
  await updateDoc(doc(db, COLLECTIONS.EMPLOYEES, id), { name });
};

export const deleteEmployee = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, COLLECTIONS.EMPLOYEES, id));
};

// Organizations
export const getOrganizations = async (): Promise<Organization[]> => {
  const querySnapshot = await getDocs(
    query(collection(db, COLLECTIONS.ORGANIZATIONS), orderBy('name'))
  );
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
  })) as Organization[];
};

export const addOrganization = async (name: string, details?: string): Promise<string> => {
  const docRef = await addDoc(collection(db, COLLECTIONS.ORGANIZATIONS), {
    name,
    details: details || '',
    createdAt: Timestamp.now(),
  });
  return docRef.id;
};

export const deleteOrganization = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, COLLECTIONS.ORGANIZATIONS, id));
};

// Work Logs
export const getWorkLog = async (date: string): Promise<WorkLog | null> => {
  const docRef = doc(db, COLLECTIONS.WORKLOGS, date);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return {
      id: docSnap.id,
      ...docSnap.data(),
      date: docSnap.data().date?.toDate(),
    } as WorkLog;
  }
  return null;
};

export const createOrUpdateWorkLog = async (
  date: string,
  employeeIds: string[]
): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.WORKLOGS, date);
  await updateDoc(docRef, {
    date: Timestamp.fromDate(new Date(date)),
    employeeIds,
  }).catch(async () => {
    // If document doesn't exist, create it
    await addDoc(collection(db, COLLECTIONS.WORKLOGS), {
      date: Timestamp.fromDate(new Date(date)),
      employeeIds,
    });
  });
};

// Cars Washed
export const getCarsWashed = async (logId: string): Promise<CarWashed[]> => {
  const querySnapshot = await getDocs(
    query(
      collection(db, COLLECTIONS.CARS_WASHED),
      where('logId', '==', logId),
      orderBy('time')
    )
  );
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
  })) as CarWashed[];
};

export const addCarWashed = async (carData: Omit<CarWashed, 'id' | 'createdAt'>): Promise<string> => {
  const docRef = await addDoc(collection(db, COLLECTIONS.CARS_WASHED), {
    ...carData,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
};

export const updateCarWashed = async (
  id: string,
  carData: Partial<Omit<CarWashed, 'id' | 'createdAt'>>
): Promise<void> => {
  await updateDoc(doc(db, COLLECTIONS.CARS_WASHED, id), carData);
};

export const deleteCarWashed = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, COLLECTIONS.CARS_WASHED, id));
};

// Appointments
export const getAppointments = async (
  startDate?: Date,
  endDate?: Date,
  status?: string
): Promise<Appointment[]> => {
  let q = query(collection(db, COLLECTIONS.APPOINTMENTS));

  if (startDate && endDate) {
    q = query(q,
      where('dateTime', '>=', Timestamp.fromDate(startDate)),
      where('dateTime', '<=', Timestamp.fromDate(endDate))
    );
  }

  if (status) {
    q = query(q, where('status', '==', status));
  }

  q = query(q, orderBy('dateTime'));

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    dateTime: doc.data().dateTime?.toDate(),
    createdAt: doc.data().createdAt?.toDate(),
  })) as Appointment[];
};

export const addAppointment = async (
  appointmentData: Omit<Appointment, 'id' | 'createdAt'>
): Promise<string> => {
  const docRef = await addDoc(collection(db, COLLECTIONS.APPOINTMENTS), {
    ...appointmentData,
    dateTime: Timestamp.fromDate(appointmentData.dateTime),
    createdAt: Timestamp.now(),
  });
  return docRef.id;
};

export const updateAppointment = async (
  id: string,
  appointmentData: Partial<Omit<Appointment, 'id' | 'createdAt'>>
): Promise<void> => {
  const updateData = { ...appointmentData } as Record<string, unknown>;
  if (appointmentData.dateTime) {
    updateData.dateTime = Timestamp.fromDate(appointmentData.dateTime);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await updateDoc(doc(db, COLLECTIONS.APPOINTMENTS, id), updateData as any);
};

export const deleteAppointment = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, COLLECTIONS.APPOINTMENTS, id));
};

// Settings
export const getSettings = async (): Promise<Settings | null> => {
  const docRef = doc(db, COLLECTIONS.SETTINGS, 'config');
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data() as Settings;
  }
  return null;
};

export const updateSettings = async (settings: Partial<Settings>): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.SETTINGS, 'config');
  await updateDoc(docRef, settings).catch(async () => {
    // If document doesn't exist, create it with defaults
    const defaultSettings: Settings = {
      salaryMethod: 'percent',
      salaryPercentValue: 30,
      adminPassword: 'admin',
      ...settings,
    };
    await addDoc(collection(db, COLLECTIONS.SETTINGS), defaultSettings);
  });
};

// Utility functions
export const deleteAllData = async (): Promise<void> => {
  const collections = Object.values(COLLECTIONS);

  for (const collectionName of collections) {
    const querySnapshot = await getDocs(collection(db, collectionName));
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
  }
};

export const checkDatabaseConnection = async (): Promise<boolean> => {
  try {
    await getDoc(doc(db, COLLECTIONS.SETTINGS, 'config'));
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
};
