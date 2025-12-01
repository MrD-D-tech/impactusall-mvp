'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface EngagementChartProps {
  data: {
    date: string;
    views: number;
    likes: number;
    shares: number;
    comments: number;
  }[];
  primaryColor: string;
}

export default function EngagementChart({ data, primaryColor }: EngagementChartProps) {
  // Format date for display
  const formattedData = data.map(item => ({
    ...item,
    displayDate: new Date(item.date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
    }),
  }));

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formattedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="displayDate" 
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '12px',
            }}
          />
          <Legend 
            wrapperStyle={{
              paddingTop: '20px',
            }}
          />
          <Line 
            type="monotone" 
            dataKey="views" 
            stroke="#8b5cf6" 
            strokeWidth={2}
            name="Views"
            dot={{ fill: '#8b5cf6', r: 3 }}
          />
          <Line 
            type="monotone" 
            dataKey="likes" 
            stroke="#ef4444" 
            strokeWidth={2}
            name="Likes"
            dot={{ fill: '#ef4444', r: 3 }}
          />
          <Line 
            type="monotone" 
            dataKey="shares" 
            stroke="#3b82f6" 
            strokeWidth={2}
            name="Shares"
            dot={{ fill: '#3b82f6', r: 3 }}
          />
          <Line 
            type="monotone" 
            dataKey="comments" 
            stroke="#10b981" 
            strokeWidth={2}
            name="Comments"
            dot={{ fill: '#10b981', r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
