import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import TaskTree from '../components/tasks/TaskTree';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import api from '../api/axiosClient';
import {
  ArrowLeft,
  Clock,
  DollarSign,
  CheckCircle2,
  Plus,
  Folder,
  AlertCircle,
  Building,
  Calendar,
  Layers,
} from 'lucide-react';

const ProjectDetailPage = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Top-level task modal / form
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [taskSubmitting, setTaskSubmitting] = useState(false);
  const [taskError, setTaskError] = useState('');

  // Project-level Log Time Modal
  const [isLogTimeModalOpen, setIsLogTimeModalOpen] = useState(false);
  const [selectedTaskForLog, setSelectedTaskForLog] = useState('');
  const [timeLogHours, setTimeLogHours] = useState('');
  const [timeLogDescription, setTimeLogDescription] = useState('');
  const [timeLogSubmitting, setTimeLogSubmitting] = useState(false);
  const [timeLogError, setTimeLogError] = useState('');

  const fetchProjectData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const tasksRes = await api.get(`/api/projects/${projectId}/tasks`);

      let taskList = [];
      let projectInfo = null;

      if (Array.isArray(tasksRes.data)) {
        taskList = tasksRes.data;
      } else if (tasksRes.data?.data) {
        taskList = Array.isArray(tasksRes.data.data) ? tasksRes.data.data : [];
      } else if (tasksRes.data?.tasks) {
        taskList = tasksRes.data.tasks;
        projectInfo = tasksRes.data.project;
      }

      setTasks(taskList);

      // Fetch project info from dashboard endpoint
      if (!projectInfo) {
        try {
          const allProjectsRes = await api.get('/api/projects');
          const all = Array.isArray(allProjectsRes.data)
            ? allProjectsRes.data
            : allProjectsRes.data.data || allProjectsRes.data.projects || [];
          projectInfo = all.find((p) => String(p.id) === String(projectId)) || {
            id: projectId,
            title: 'Project Details',
          };
        } catch {
          projectInfo = { id: projectId, title: 'Project Details' };
        }
      }

      setProject(projectInfo);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to load project details and tasks. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProjectData();
  }, [fetchProjectData]);

  const handleCreateTopLevelTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      setTaskSubmitting(true);
      setTaskError('');
      await api.post('/api/tasks', {
        title: newTaskTitle.trim(),
        project_id: projectId,
        parent_task_id: null,
      });
      setNewTaskTitle('');
      setIsAddingTask(false);
      await fetchProjectData();
    } catch (err) {
      setTaskError(err.response?.data?.message || 'Failed to add task.');
    } finally {
      setTaskSubmitting(false);
    }
  };

  const handleLogTimeSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTaskForLog) {
      setTimeLogError('Please choose a task to log time against.');
      return;
    }
    const parsedHours = parseFloat(timeLogHours);
    if (isNaN(parsedHours) || parsedHours <= 0) {
      setTimeLogError('Please enter a valid positive duration in hours.');
      return;
    }

    try {
      setTimeLogSubmitting(true);
      setTimeLogError('');
      await api.post(`/api/time-logs`, {
        task_id: selectedTaskForLog,
        hours: parsedHours,
        description: timeLogDescription.trim(),
      });
      setTimeLogHours('');
      setTimeLogDescription('');
      setSelectedTaskForLog('');
      setIsLogTimeModalOpen(false);
      await fetchProjectData();
    } catch (err) {
      setTimeLogError(err.response?.data?.message || 'Failed to log time.');
    } finally {
      setTimeLogSubmitting(false);
    }
  };

  // Compute calculated metrics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(
    (t) => Boolean(t.is_completed)
  ).length;
  const progressPercent =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const totalHoursLogged = tasks.reduce(
    (acc, t) => acc + Number(t.hours_logged || 0),
    0
  ) || Number(project?.total_hours_worked || 0);

  const hourlyRate = Number(
    project?.hourly_rate || project?.client?.hourly_rate || 0
  );
  const totalEarned =
    hourlyRate > 0
      ? totalHoursLogged * hourlyRate
      : Number(project?.total_earned || 0);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Back Link */}
        <div>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <div className="flex-1">{error}</div>
            <button
              onClick={fetchProjectData}
              className="underline text-xs font-semibold cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="py-24">
            <LoadingSpinner message="Loading project tasks and details..." />
          </div>
        ) : (
          <>
            {/* Project Header Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {project?.status || 'Active'}
                    </span>
                    {project?.client_name || project?.client?.name ? (
                      <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100 px-3 py-1 rounded-full font-medium">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        {project?.client_name || project?.client?.name}
                      </span>
                    ) : null}
                    {hourlyRate > 0 && (
                      <span className="text-xs text-slate-500 font-medium">
                        ${hourlyRate.toFixed(2)} / hour
                      </span>
                    )}
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {project?.title || project?.name || 'Project Overview'}
                  </h1>

                  {project?.description && (
                    <p className="text-sm text-slate-500 max-w-3xl leading-relaxed">
                      {project.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => {
                      setTimeLogError('');
                      setIsLogTimeModalOpen(true);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    <Clock className="w-4 h-4" />
                    <span>Log Time</span>
                  </button>

                  <button
                    onClick={() => setIsAddingTask(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Task</span>
                  </button>
                </div>
              </div>

              {/* Summary Stats Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
                      Total Time
                    </span>
                    <span className="text-xl font-bold text-slate-900">
                      {Number(totalHoursLogged).toFixed(1)} hrs
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
                      Total Earned
                    </span>
                    <span className="text-xl font-bold text-emerald-600">
                      ${Number(totalEarned).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-1">
                      <span className="uppercase tracking-wider">Progress</span>
                      <span className="font-bold text-slate-700">{progressPercent}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      {completedTasks} of {totalTasks} tasks completed
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Add Top-Level Task Banner */}
            {isAddingTask && (
              <div className="bg-white rounded-2xl border border-indigo-200 p-5 shadow-xs">
                <form onSubmit={handleCreateTopLevelTask} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                      <Plus className="w-4 h-4 text-indigo-600" />
                      Add New Top-Level Task
                    </h3>
                    <button
                      type="button"
                      onClick={() => setIsAddingTask(false)}
                      className="text-xs text-slate-400 hover:text-slate-600"
                    >
                      Cancel
                    </button>
                  </div>

                  {taskError && (
                    <div className="p-2.5 rounded-lg bg-rose-50 text-xs text-rose-700">
                      {taskError}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      autoFocus
                      required
                      placeholder="e.g. Design homepage wireframe..."
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      className="flex-1 px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="submit"
                      disabled={taskSubmitting || !newTaskTitle.trim()}
                      className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {taskSubmitting ? 'Adding...' : 'Create Task'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Task Tree Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-indigo-600" />
                    Task Breakdown & Time Logging
                  </h2>
                  <p className="text-xs text-slate-500">
                    Manage hierarchical tasks, collapse subtasks, and log billable hours
                  </p>
                </div>
              </div>

              <TaskTree tasks={tasks} onTasksUpdated={fetchProjectData} />
            </div>
          </>
        )}
      </main>

      {/* Modal: Log Time */}
      <Modal
        isOpen={isLogTimeModalOpen}
        onClose={() => setIsLogTimeModalOpen(false)}
        title="Log Work Hours"
      >
        <form onSubmit={handleLogTimeSubmit} className="space-y-4">
          {timeLogError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700">
              {timeLogError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Task <span className="text-rose-500">*</span>
            </label>
            {tasks.length === 0 ? (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
                Please create a task first before logging hours.
              </div>
            ) : (
              <select
                required
                value={selectedTaskForLog}
                onChange={(e) => setSelectedTaskForLog(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
              >
                <option value="">Choose task...</option>
                {tasks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {'- '.repeat(t.depth || 0)} {t.title}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Hours Logged <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              step="0.25"
              min="0.25"
              required
              placeholder="e.g. 2.5"
              value={timeLogHours}
              onChange={(e) => setTimeLogHours(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Work Description (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="What did you work on?"
              value={timeLogDescription}
              onChange={(e) => setTimeLogDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsLogTimeModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={timeLogSubmitting || tasks.length === 0}
              className="px-5 py-2 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              {timeLogSubmitting ? 'Saving...' : 'Save Time Entry'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectDetailPage;
