import React, { useState } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Clock,
  CheckCircle2,
  Circle,
  Loader2,
  Calendar,
} from 'lucide-react';
import api from '../../api/axiosClient';

const TaskTree = ({ tasks = [], onTasksUpdated }) => {
  // Collapsed state map by taskId
  const [collapsedMap, setCollapsedMap] = useState({});
  // Inline active state: { type: 'subtask' | 'time', taskId: string | number }
  const [activeForm, setActiveForm] = useState(null);

  // Subtask form state
  const [subtaskTitle, setSubtaskTitle] = useState('');
  const [isSubmittingSubtask, setIsSubmittingSubtask] = useState(false);

  // Time logging form state
  const [logHours, setLogHours] = useState('');
  const [logDescription, setLogDescription] = useState('');
  const [isSubmittingTime, setIsSubmittingTime] = useState(false);

  // Toggling completion state
  const [updatingTaskId, setUpdatingTaskId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const toggleCollapse = (taskId) => {
    setCollapsedMap((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  const handleToggleCompletion = async (task) => {
    try {
      setUpdatingTaskId(task.id);
      setErrorMsg('');
      const newStatus = !task.is_completed;
      await api.patch(`/api/tasks/${task.id}`, {
        is_completed: newStatus,
      });
      if (onTasksUpdated) {
        await onTasksUpdated();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update task status.');
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const handleCreateSubtask = async (e, parentTask) => {
    e.preventDefault();
    if (!subtaskTitle.trim()) return;

    try {
      setIsSubmittingSubtask(true);
      setErrorMsg('');
      await api.post(`/api/tasks`, {
        title: subtaskTitle.trim(),
        parent_task_id: parentTask.id,
        project_id: parentTask.project_id,
      });
      setSubtaskTitle('');
      setActiveForm(null);
      if (onTasksUpdated) {
        await onTasksUpdated();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to create subtask.');
    } finally {
      setIsSubmittingSubtask(false);
    }
  };

  const handleLogTime = async (e, taskId) => {
    e.preventDefault();
    const hoursNum = parseFloat(logHours);
    if (isNaN(hoursNum) || hoursNum <= 0) {
      setErrorMsg('Please enter a valid positive number for hours.');
      return;
    }

    try {
      setIsSubmittingTime(true);
      setErrorMsg('');
      await api.post(`/api/time-logs`, {
        task_id: taskId,
        hours: hoursNum,
        description: logDescription.trim(),
      });
      setLogHours('');
      setLogDescription('');
      setActiveForm(null);
      if (onTasksUpdated) {
        await onTasksUpdated();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to log time.');
    } finally {
      setIsSubmittingTime(false);
    }
  };

  // Helper to determine if children of a given task should be visible
  const isParentCollapsed = (taskIndex, currentDepth) => {
    for (let i = taskIndex - 1; i >= 0; i--) {
      const prev = tasks[i];
      const prevDepth = prev.depth ?? 0;
      if (prevDepth < currentDepth) {
        if (collapsedMap[prev.id]) return true;
        currentDepth = prevDepth;
      }
    }
    return false;
  };

  if (!tasks || tasks.length === 0) {
    return (
      <div className="text-center py-12 px-4 bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
        <Circle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <h4 className="text-sm font-semibold text-slate-700">No tasks created yet</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Add your first task above to start tracking milestones, logging hours, and breaking work into subtasks.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {errorMsg && (
        <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700">
          {errorMsg}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 shadow-xs">
        {tasks.map((task, index) => {
          const depth = task.depth ?? 0;
          const isCollapsed = collapsedMap[task.id];

          // Check if the next task has greater depth to show collapse arrow
          const hasChildren = index + 1 < tasks.length && (tasks[index + 1].depth ?? 0) > depth;

          // Check if any ancestor is collapsed
          if (depth > 0 && isParentCollapsed(index, depth)) {
            return null;
          }

          const isCompleted = Boolean(task.is_completed);
          const isUpdating = updatingTaskId === task.id;

          const isAddingSubtask = activeForm?.type === 'subtask' && activeForm?.taskId === task.id;
          const isLoggingTime = activeForm?.type === 'time' && activeForm?.taskId === task.id;

          return (
            <div key={task.id} className="transition-colors hover:bg-slate-50/60">
              <div
                className="flex items-center justify-between py-3 px-4 gap-3"
                style={{ paddingLeft: `${Math.max(16, depth * 28 + 16)}px` }}
              >
                {/* Left: Expander, Checkbox, Title */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {hasChildren ? (
                    <button
                      type="button"
                      onClick={() => toggleCollapse(task.id)}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors cursor-pointer"
                      title={isCollapsed ? 'Expand subtasks' : 'Collapse subtasks'}
                    >
                      {isCollapsed ? (
                        <ChevronRight className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  ) : (
                    <div className="w-6" />
                  )}

                  <button
                    type="button"
                    onClick={() => handleToggleCompletion(task)}
                    disabled={isUpdating}
                    className="text-slate-400 hover:text-indigo-600 focus:outline-none cursor-pointer transition-colors"
                  >
                    {isUpdating ? (
                      <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                    ) : isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-300 hover:text-indigo-400" />
                    )}
                  </button>

                  <span
                    className={`text-sm truncate select-none ${
                      isCompleted ? 'line-through text-slate-400 font-normal' : 'text-slate-800 font-medium'
                    }`}
                  >
                    {task.title}
                  </span>

                  {task.hours_logged ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60 shrink-0">
                      <Clock className="w-3 h-3 text-amber-600" />
                      {Number(task.hours_logged).toFixed(1)}h
                    </span>
                  ) : null}
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      if (isAddingSubtask) {
                        setActiveForm(null);
                      } else {
                        setActiveForm({ type: 'subtask', taskId: task.id });
                        setSubtaskTitle('');
                      }
                    }}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                      isAddingSubtask
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-100'
                    }`}
                    title="Add Subtask"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Subtask</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (isLoggingTime) {
                        setActiveForm(null);
                      } else {
                        setActiveForm({ type: 'time', taskId: task.id });
                        setLogHours('');
                        setLogDescription('');
                      }
                    }}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                      isLoggingTime
                        ? 'bg-amber-100 text-amber-800'
                        : 'text-slate-600 hover:text-amber-600 hover:bg-slate-100'
                    }`}
                    title="Log Hours"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Log Time</span>
                  </button>
                </div>
              </div>

              {/* Inline Subtask Form */}
              {isAddingSubtask && (
                <div
                  className="bg-indigo-50/50 p-3 border-t border-slate-100"
                  style={{ paddingLeft: `${Math.max(28, (depth + 1) * 28 + 16)}px` }}
                >
                  <form
                    onSubmit={(e) => handleCreateSubtask(e, task)}
                    className="flex flex-col sm:flex-row gap-2 max-w-xl"
                  >
                    <input
                      type="text"
                      autoFocus
                      required
                      placeholder="Subtask title..."
                      value={subtaskTitle}
                      onChange={(e) => setSubtaskTitle(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-indigo-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="submit"
                        disabled={isSubmittingSubtask || !subtaskTitle.trim()}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {isSubmittingSubtask ? 'Adding...' : 'Add Subtask'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveForm(null)}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Inline Time Logging Form */}
              {isLoggingTime && (
                <div
                  className="bg-amber-50/50 p-3 border-t border-slate-100"
                  style={{ paddingLeft: `${Math.max(28, depth * 28 + 16)}px` }}
                >
                  <form
                    onSubmit={(e) => handleLogTime(e, task.id)}
                    className="flex flex-col sm:flex-row gap-2 max-w-xl items-start sm:items-center"
                  >
                    <input
                      type="number"
                      step="0.25"
                      min="0.25"
                      required
                      autoFocus
                      placeholder="Hours (e.g. 1.5)"
                      value={logHours}
                      onChange={(e) => setLogHours(e.target.value)}
                      className="w-full sm:w-28 px-3 py-1.5 text-xs rounded-lg border border-amber-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                    <input
                      type="text"
                      placeholder="Work description (optional)"
                      value={logDescription}
                      onChange={(e) => setLogDescription(e.target.value)}
                      className="flex-1 w-full px-3 py-1.5 text-xs rounded-lg border border-amber-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="submit"
                        disabled={isSubmittingTime || !logHours}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-600 hover:bg-amber-700 text-white transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {isSubmittingTime ? 'Saving...' : 'Save Log'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveForm(null)}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TaskTree;
