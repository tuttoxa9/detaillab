// Базовые типы для приложения Detail Lab

export interface Employee {
  id: string;
  name: string;
  createdAt: Date;
}

export interface Organization {
  id: string;
  name: string;
  details?: string;
  createdAt: Date;
}

export interface WorkLog {
  id: string; // Format: YYYY-MM-DD
  date: Date;
  employeeIds: string[];
}

export interface CarWashed {
  id: string;
  logId: string; // Reference to WorkLog
  time: string;
  carName: string;
  service: string;
  cost: number;
  paymentType: 'cash' | 'card' | 'organization';
  organizationId?: string;
  createdAt: Date;
}

export interface Appointment {
  id: string;
  dateTime: Date;
  clientName: string;
  clientPhone: string;
  carInfo: string;
  service?: string;
  status: 'planned' | 'completed' | 'canceled';
  cost?: number;
  paymentType?: 'cash' | 'card' | 'organization';
  organizationId?: string;
  createdAt: Date;
}

export interface Settings {
  salaryMethod: 'percent' | 'min_plus_percent';
  salaryPercentValue: number;
  minDailyRate?: number;
  bonusPercentValue?: number;
  backgroundImageUrl?: string;
  adminPassword: string;
}

export interface DailySummary {
  totalRevenue: number;
  employeeSalaries: { [employeeId: string]: number };
}

export interface SalaryCalculation {
  employeeId: string;
  employeeName: string;
  shifts: number;
  totalRevenue: number;
  salary: number;
}
