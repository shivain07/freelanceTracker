
const API_BASE = "/api";

export const API_ROUTES = {
  health: {
    check: `${API_BASE}/health`,
  },
  auth: {
    google: `${API_BASE}/auth/google`,
    logout: `${API_BASE}/auth/logout`,
    verify: `${API_BASE}/auth/verify`,
  },
  client: {
    getAllClients: `${API_BASE}/clients`,
    addClient: `${API_BASE}/clients`,
    deleteClient: (clientId)=> `${API_BASE}/clients/${encodeURIComponent(clientId)}`,
  },
  project: {
    getAllProjects: `${API_BASE}/projects`,
    addProject: `${API_BASE}/projects`,
    getProject: (projectId) =>
      `${API_BASE}/projects/${encodeURIComponent(projectId)}/tasks`,
    deleteProject: (projectId) =>
      `${API_BASE}/projects/${encodeURIComponent(projectId)}`,
  },
  task: {
    getTasks: (projectId) =>
      `${API_BASE}/tasks/project/${encodeURIComponent(projectId)}`,
    createTask: `${API_BASE}/tasks`,
    patchTask: (taskId) =>
      `${API_BASE}/tasks/${encodeURIComponent(taskId)}`,
    deleteTask: (taskId) =>
      `${API_BASE}/tasks/${encodeURIComponent(taskId)}`,
  },
  timelog: {
    newTime: `${API_BASE}/time-logs`,
    getTime: (taskId) =>
      `${API_BASE}/time-logs/task/${encodeURIComponent(taskId)}`,
  },
};

export default API_ROUTES;
