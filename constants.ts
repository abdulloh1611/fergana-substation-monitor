
import { UserRole, Substation, Device } from './types';

export const SUBSTATIONS: Substation[] = [
  { id: 'sub-1', name: 'Fergana Central', location: 'City Center' },
  { id: 'sub-2', name: 'Margilan North', location: 'Industrial Zone' },
  { id: 'sub-3', name: 'Kokand East', location: 'Business District' },
];

export const DEVICES: Device[] = [
  { id: 'dev-1', name: 'Transformer T-1', substationId: 'sub-1', type: 'Transformer' },
  { id: 'dev-2', name: 'Transformer T-2', substationId: 'sub-1', type: 'Transformer' },
  { id: 'dev-3', name: 'Feeder F-5', substationId: 'sub-1', type: 'Feeder' },
  { id: 'dev-4', name: 'Transformer M-1', substationId: 'sub-2', type: 'Transformer' },
  { id: 'dev-5', name: 'Main Bus 110kV', substationId: 'sub-3', type: 'Bus' },
];

export const COLORS = {
  phaseA: '#ef4444', // Red
  phaseB: '#fbbf24', // Yellow/Amber
  phaseC: '#3b82f6', // Blue
  primary: '#1e3a8a', // Dark Navy
  secondary: '#64748b' // Slate
};
