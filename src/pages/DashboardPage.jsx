import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/layout/Navbar';
import StatsCards from '../components/dashboard/StatsCards';
import ProjectTable from '../components/dashboard/ProjectTable';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import api from '../api/axiosClient';
import { Plus, Users, FolderPlus, AlertCircle } from 'lucide-react';

const DashboardPage = () => {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  // New Client Form state
  const [clientForm, setClientForm] = useState({
    name: '',
    email: '',
    hourly_rate: '',
  });
  const [clientSubmitting, setClientSubmitting] = useState(false);
  const [clientError, setClientError] = useState('');

  // New Project Form state
  const [projectForm, setProjectForm] = useState({
    client_id: '',
    title: '',
    description: '',
  });
  const [projectSubmitting, setProjectSubmitting] = useState(false);
  const [projectError, setProjectError] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [projectsRes, clientsRes] = await Promise.all([
        api.get('/api/projects'),
        api.get('/api/clients'),
      ]);

      // Backend wraps responses in { success, data }
      const projectsList = Array.isArray(projectsRes.data)
        ? projectsRes.data
        : projectsRes.data.data || projectsRes.data.projects || [];
      const clientsList = Array.isArray(clientsRes.data)
        ? clientsRes.data
        : clientsRes.data.data || clientsRes.data.clients || [];

      setProjects(projectsList);
      setClients(clientsList);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Compute stats
  const totalProjects = projects.length;
  const activeProjects = projects.filter(
    (p) => (p.status || 'active').toLowerCase() === 'active'
  ).length;
  const totalHours = projects.reduce(
    (sum, p) => sum + Number(p.total_hours_worked || p.total_hours || 0),
    0
  );
  const totalEarned = projects.reduce(
    (sum, p) => sum + Number(p.total_earned || 0),
    0
  );

  const stats = {
    totalProjects,
    activeProjects,
    totalHours,
    totalEarned,
  };

  const handleCreateClient = async (e) => {
    e.preventDefault();
    if (!clientForm.name.trim()) {
      setClientError('Client name is required.');
      return;
    }

    try {
      setClientSubmitting(true);
      setClientError('');
      const payload = {
        name: clientForm.name.trim(),
        email: clientForm.email.trim() || undefined,
        hourly_rate: clientForm.hourly_rate ? parseFloat(clientForm.hourly_rate) : 0,
      };

      const response = await api.post('/api/clients', payload);
      const createdClient = response.data.data || response.data.client || response.data;
      setClients((prev) => [...prev, createdClient]);
      setClientForm({ name: '', email: '', hourly_rate: '' });
      setIsClientModalOpen(false);

      // Refresh to update any linked statistics
      fetchData();
    } catch (err) {
      setClientError(err.response?.data?.message || 'Failed to create client.');
    } finally {
      setClientSubmitting(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!projectForm.title.trim()) {
      setProjectError('Project title is required.');
      return;
    }
    if (!projectForm.client_id) {
      setProjectError('Please select a client.');
      return;
    }

    try {
      setProjectSubmitting(true);
      setProjectError('');
      const payload = {
        title: projectForm.title.trim(),
        client_id: projectForm.client_id,
        description: projectForm.description.trim() || undefined,
      };

      await api.post('/api/projects', payload);
      setProjectForm({ client_id: '', title: '', description: '' });
      setIsProjectModalOpen(false);
      fetchData();
    } catch (err) {
      setProjectError(err.response?.data?.message || 'Failed to create project.');
    } finally {
      setProjectSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top Header & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Dashboard
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Overview of your current freelance projects, billable hours, and clients.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setClientError('');
                setIsClientModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-300 hover:border-slate-400 text-slate-700 text-sm font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Users className="w-4 h-4 text-slate-500" />
              <span>Add Client</span>
            </button>

            <button
              onClick={() => {
                setProjectError('');
                setIsProjectModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <FolderPlus className="w-4 h-4" />
              <span>New Project</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <div className="flex-1">{error}</div>
            <button
              onClick={fetchData}
              className="underline text-xs font-semibold cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="py-20">
            <LoadingSpinner message="Loading dashboard statistics and projects..." />
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <StatsCards stats={stats} />

            {/* Projects Table Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Projects</h2>
                  <p className="text-xs text-slate-500">
                    Showing all ongoing and past client projects
                  </p>
                </div>
                <span className="text-xs font-medium text-slate-500 bg-slate-200/60 px-2.5 py-1 rounded-full">
                  {projects.length} {projects.length === 1 ? 'project' : 'projects'}
                </span>
              </div>

              <ProjectTable
                projects={projects}
                onNewProjectClick={() => setIsProjectModalOpen(true)}
              />
            </div>
          </>
        )}
      </main>

      {/* Modal: Add Client */}
      <Modal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        title="Add New Client"
      >
        <form onSubmit={handleCreateClient} className="space-y-4">
          {clientError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700">
              {clientError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Client Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Acme Corporation"
              value={clientForm.name}
              onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Client Email (Optional)
            </label>
            <input
              type="email"
              placeholder="billing@acme.com"
              value={clientForm.email}
              onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Default Hourly Rate ($/hr)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="e.g. 75.00"
              value={clientForm.hourly_rate}
              onChange={(e) => setClientForm({ ...clientForm, hourly_rate: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsClientModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={clientSubmitting}
              className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              {clientSubmitting ? 'Saving...' : 'Save Client'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Add Project */}
      <Modal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        title="Create New Project"
      >
        <form onSubmit={handleCreateProject} className="space-y-4">
          {projectError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700">
              {projectError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Client <span className="text-rose-500">*</span>
            </label>
            {clients.length === 0 ? (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center justify-between">
                <span>No clients available. Please create a client first.</span>
                <button
                  type="button"
                  onClick={() => {
                    setIsProjectModalOpen(false);
                    setIsClientModalOpen(true);
                  }}
                  className="font-bold underline cursor-pointer"
                >
                  Create Client
                </button>
              </div>
            ) : (
              <select
                required
                value={projectForm.client_id}
                onChange={(e) => setProjectForm({ ...projectForm, client_id: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              >
                <option value="">Select a client...</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.hourly_rate ? `($${c.hourly_rate}/hr)` : ''}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Project Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Website Redesign & SEO"
              value={projectForm.title}
              onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Brief summary of project deliverables and goals..."
              value={projectForm.description}
              onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsProjectModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={projectSubmitting || clients.length === 0}
              className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              {projectSubmitting ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DashboardPage;
