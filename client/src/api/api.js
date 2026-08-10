import axios from "axios";
import { TOKEN_KEY } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getPrograms = () => api.get("/programs").then((r) => r.data);
export const getTrainers = () => api.get("/trainers").then((r) => r.data);
export const getPlans = () => api.get("/plans").then((r) => r.data);
export const createLead = (payload) => api.post("/leads", payload).then((r) => r.data);

export const login = (email, password) =>
  api.post("/auth/login", { email, password }).then((r) => r.data);

export const register = (name, email, password) =>
  api.post("/auth/register", { name, email, password }).then((r) => r.data);

export const getMe = () => api.get("/auth/me").then((r) => r.data);
export const getUsers = () => api.get("/auth/users").then((r) => r.data);
export const deleteUser = (id) => api.delete(`/auth/users/${id}`).then((r) => r.data);

export const getLeads = (params) => api.get("/leads", { params }).then((r) => r.data);
export const updateLeadStatus = (id, status) =>
  api.patch(`/leads/${id}`, { status }).then((r) => r.data);
export const deleteLead = (id) => api.delete(`/leads/${id}`).then((r) => r.data);

export const getStats = () => api.get("/stats").then((r) => r.data);

export const createProgram = (data) => api.post("/programs", data).then((r) => r.data);
export const updateProgram = (id, data) => api.put(`/programs/${id}`, data).then((r) => r.data);
export const deleteProgram = (id) => api.delete(`/programs/${id}`).then((r) => r.data);

export const createTrainer = (data) => api.post("/trainers", data).then((r) => r.data);
export const updateTrainer = (id, data) => api.put(`/trainers/${id}`, data).then((r) => r.data);
export const deleteTrainer = (id) => api.delete(`/trainers/${id}`).then((r) => r.data);

export const createPlan = (data) => api.post("/plans", data).then((r) => r.data);
export const updatePlan = (id, data) => api.put(`/plans/${id}`, data).then((r) => r.data);
export const deletePlan = (id) => api.delete(`/plans/${id}`).then((r) => r.data);

export default api;
