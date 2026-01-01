
import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Measurement } from '../types';
import { COLORS } from '../constants';

interface Props {
  data: Measurement[];
}

export const VoltageChart: React.FC<Props> = ({ data }) => {
  const chartData = data.map(m => ({
    time: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    A: m.phaseA,
    B: m.phaseB,
    C: m.phaseC,
  }));

  return (
    <div className="h-64 w-full bg-white rounded-xl p-4 shadow-sm border border-slate-100">
      <h3 className="text-sm font-semibold text-slate-500 mb-4 uppercase tracking-wider">Voltage Trend (Phase A/B/C)</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Legend />
          <Line type="monotone" dataKey="A" stroke={COLORS.phaseA} strokeWidth={3} dot={false} activeDot={{ r: 8 }} />
          <Line type="monotone" dataKey="B" stroke={COLORS.phaseB} strokeWidth={3} dot={false} activeDot={{ r: 8 }} />
          <Line type="monotone" dataKey="C" stroke={COLORS.phaseC} strokeWidth={3} dot={false} activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
