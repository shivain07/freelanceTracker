import React from 'react';
import { FolderOpen, CheckCircle2, Clock, DollarSign } from 'lucide-react';

const StatsCards = ({ stats = {} }) => {
  const {
    totalProjects = 0,
    activeProjects = 0,
    totalHours = 0,
    totalEarned = 0,
  } = stats;

  const cards = [
    {
      label: 'Total Projects',
      value: totalProjects,
      icon: FolderOpen,
      iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      accentColor: 'text-indigo-600',
      description: 'All tracked projects',
    },
    {
      label: 'Active Projects',
      value: activeProjects,
      icon: CheckCircle2,
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      accentColor: 'text-emerald-600',
      description: 'Currently in progress',
    },
    {
      label: 'Total Hours',
      value: `${Number(totalHours).toFixed(1)} hrs`,
      icon: Clock,
      iconBg: 'bg-amber-50 text-amber-600 border-amber-100',
      accentColor: 'text-amber-600',
      description: 'Billable time logged',
    },
    {
      label: 'Total Earned',
      value: `$${Number(totalEarned).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      iconBg: 'bg-blue-50 text-blue-600 border-blue-100',
      accentColor: 'text-blue-600',
      description: 'Calculated project revenue',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      {cards.map((card, idx) => {
        const IconComponent = card.icon;
        return (
          <div
            key={idx}
            className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow duration-200 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-slate-500">{card.label}</span>
              <div className={`p-2.5 rounded-xl border ${card.iconBg}`}>
                <IconComponent className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
                {card.value}
              </div>
              <p className="text-xs text-slate-400 mt-1">{card.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;
