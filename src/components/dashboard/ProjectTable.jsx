import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Folder, ArrowRight, Clock, DollarSign, CheckCircle2 } from 'lucide-react';

const ProjectTable = ({ projects = [], onNewProjectClick }) => {
  const navigate = useNavigate();

  const getStatusBadge = (status) => {
    const normalized = (status || 'active').toLowerCase();
    switch (normalized) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Active
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
            <CheckCircle2 className="w-3 h-3 text-blue-500" />
            Completed
          </span>
        );
      case 'archived':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
            Archived
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  if (!projects || projects.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
          <Folder className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-1">No projects yet</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
          Start by creating your first client and project to track time, manage tasks, and calculate billing.
        </p>
        {onNewProjectClick && (
          <button
            onClick={onNewProjectClick}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Create Your First Project
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/75 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-4 px-6">Project Title</th>
              <th className="py-4 px-6">Client</th>
              <th className="py-4 px-6">Status</th>
              <th className="py-4 px-6 text-right">Hours Worked</th>
              <th className="py-4 px-6 text-right">Earned</th>
              <th className="py-4 px-6 text-center">Tasks (Pending/Total)</th>
              <th className="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {projects.map((project) => {
              const totalHours = Number(project.total_hours_worked || 0);
              const totalEarned = Number(project.total_earned || 0);
              const pendingTasks = Number(project.pending_tasks || 0);
              const totalTasks = Number(project.total_tasks || 0);

              return (
                <tr
                  key={project.id}
                  className="hover:bg-slate-50/75 transition-colors group cursor-pointer"
                  onClick={() => navigate(`/projects/${project.id}`)}
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 group-hover:bg-indigo-100 text-indigo-600 flex items-center justify-center transition-colors shrink-0">
                        <Folder className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {project.title || project.name}
                        </span>
                        {project.description && (
                          <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                            {project.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-6">
                    <span className="font-medium text-slate-700">
                      {project.client_name || project.client?.name || 'N/A'}
                    </span>
                    {(project.hourly_rate || project.client?.hourly_rate) && (
                      <span className="text-xs text-slate-400 block">
                        ${Number(project.hourly_rate || project.client?.hourly_rate).toFixed(2)}/hr
                      </span>
                    )}
                  </td>

                  <td className="py-4 px-6">
                    {getStatusBadge(project.status)}
                  </td>

                  <td className="py-4 px-6 text-right">
                    <span className="font-semibold text-slate-700 inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {totalHours.toFixed(1)} hrs
                    </span>
                  </td>

                  <td className="py-4 px-6 text-right">
                    <span className="font-semibold text-emerald-600 inline-flex items-center gap-0.5">
                      <DollarSign className="w-3.5 h-3.5" />
                      {totalEarned.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </td>

                  <td className="py-4 px-6 text-center">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                      <span className="text-amber-600 font-semibold">{pendingTasks}</span>
                      <span>/</span>
                      <span>{totalTasks}</span>
                    </span>
                  </td>

                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/projects/${project.id}`);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
                    >
                      <span>View</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProjectTable;
