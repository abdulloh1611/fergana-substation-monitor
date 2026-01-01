
export enum UserRole {
  ADMIN = 'ADMIN',
  OPERATOR = 'OPERATOR'
}

export type Language = 'uz' | 'ru' | 'en' | 'cr';

export interface User {
  id: string;
  login: string;
  substationId: string;
  role: UserRole;
  name: string;
}

export interface Substation {
  id: string;
  name: string;
  location: string;
  username?: string;
  password?: string;
  status?: 'active' | 'maintenance' | 'offline';
}

export interface Device {
  id: string;
  name: string;
  substationId: string;
  type: string;
}

export interface Measurement {
  id: string;
  deviceId: string;
  phaseA: number;
  phaseB: number;
  phaseC: number;
  timestamp: string;
  operatorId: string;
}

export interface AIAnalysis {
  summary: string;
  anomalies: string[];
  recommendations: string[];
}
