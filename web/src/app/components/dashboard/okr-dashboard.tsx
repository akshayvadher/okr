'use client';

import { Progress } from '@/components/ui/progress';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useObjectivesFromPool } from '@/sync/object-pool';

export function OKRDashboard() {
  const objectives = useObjectivesFromPool();

  if (objectives.length === 0) {
    return null;
  }

  const statusCounts = {
    'on-track': 0,
    'at-risk': 0,
    behind: 0,
  };

  objectives.forEach((obj) => {
    statusCounts[obj.status]++;
  });

  const statusData = [
    { name: 'On Track', value: statusCounts['on-track'], color: '#10B981' },
    { name: 'At Risk', value: statusCounts['at-risk'], color: '#F59E0B' },
    { name: 'Behind', value: statusCounts['behind'], color: '#EF4444' },
  ];

  const progressData = objectives
    .map((obj) => ({
      name:
        obj.title.length > 25 ? obj.title.substring(0, 25) + '...' : obj.title,
      progress: obj.progress,
      color:
        obj.status === 'on-track'
          ? '#10B981'
          : obj.status === 'at-risk'
            ? '#F59E0B'
            : '#EF4444',
    }))
    .sort((a, b) => b.progress - a.progress);

  return (
    <div className="mb-8 bg-white p-6 rounded-lg border">
      <h2 className="text-xl font-semibold mb-6">OKR Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {statusData.map((status) => (
          <div key={status.name} className="bg-gray-50 p-4 rounded-lg border">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              {status.name}
            </h3>
            <p className="text-2xl font-bold" style={{ color: status.color }}>
              {status.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h3 className="text-base font-medium mb-4">Status Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" />
                <Tooltip
                  formatter={(value) => [`${value} objectives`, 'Count']}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <h3 className="text-base font-medium mb-4">Objective Progress</h3>
          <div className="space-y-4">
            {progressData.slice(0, 5).map((item) => (
              <div key={item.name} className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{item.name}</span>
                  <span className="text-sm">{item.progress}%</span>
                </div>
                <Progress
                  value={item.progress}
                  className="h-2"
                  style={
                    {
                      '--progress-background': item.color,
                    } as React.CSSProperties
                  }
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
