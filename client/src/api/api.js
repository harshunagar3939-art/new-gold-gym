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

// Default Website Data Constants
export const DEFAULT_PROGRAMS = [
  { _id: "prog-1", order: 1, title: "Strength Training", description: "Barbell fundamentals, progressive overload and powerlifting technique." },
  { _id: "prog-2", order: 2, title: "CrossFit Conditioning", description: "High-intensity functional workouts that build engine and grit." },
  { _id: "prog-3", order: 3, title: "Boxing & Combat", description: "Pad work, bag rounds and footwork drills with certified coaches." },
  { _id: "prog-4", order: 4, title: "Personal Coaching", description: "One-on-one programming built around your goals and recovery." },
  { _id: "prog-5", order: 5, title: "Mobility & Recovery", description: "Stretch labs and recovery sessions to keep you training pain-free." },
  { _id: "prog-6", order: 6, title: "Nutrition Coaching", description: "Meal planning and macro coaching that fits an Indian kitchen." },
];

export const DEFAULT_TRAINERS = [
  { _id: "tr-1", name: "Rohan Mehta", role: "Head of Strength", photo: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&q=80" },
  { _id: "tr-2", name: "Priya Nair", role: "CrossFit Coach", photo: "https://images.unsplash.com/photo-1594381898411-846e7d193883?w=500&q=80" },
  { _id: "tr-3", name: "Arjun Patel", role: "Boxing Coach", photo: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=500&q=80" },
  { _id: "tr-4", name: "Sana Sheikh", role: "Nutrition Lead", photo: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500&q=80" },
];

export const DEFAULT_PLANS = [
  {
    _id: "plan-1",
    key: "basic",
    name: "3 Month Plan",
    price: 2500,
    period: "/Yr",
    featured: false,
    features: ["Full gym floor access", "Locker room & showers", "Standard hours (6AM–10PM)"],
  },
  {
    _id: "plan-2",
    key: "gold",
    name: "6 Month Plan",
    price: 3500,
    period: "/Yr",
    featured: false,
    features: ["Everything in Basic", "24/7 access", "4 group classes / week", "Nutrition check-ins"],
  },
  {
    _id: "plan-3",
    key: "elite",
    name: "1 Year Plan",
    price: 4500,
    period: "/Yr",
    featured: true,
    features: ["Everything in Gold", "2 personal training sessions", "Recovery lab access", "Priority booking"],
  },
];

// Helper functions for Local Storage persistence & Real-Time Event Sync
export const notifyDataChange = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("ngg_data_updated"));
  }
};

export const getStoredPrograms = () => {
  const data = localStorage.getItem("ngg_programs");
  if (data) {
    try { return JSON.parse(data); } catch {}
  }
  return DEFAULT_PROGRAMS;
};

export const saveStoredPrograms = (items) => {
  localStorage.setItem("ngg_programs", JSON.stringify(items));
  localStorage.setItem("ngg_programs_customized", "true");
  notifyDataChange();
};

export const getStoredTrainers = () => {
  const data = localStorage.getItem("ngg_trainers");
  if (data) {
    try { return JSON.parse(data); } catch {}
  }
  return DEFAULT_TRAINERS;
};

export const saveStoredTrainers = (items) => {
  localStorage.setItem("ngg_trainers", JSON.stringify(items));
  localStorage.setItem("ngg_trainers_customized", "true");
  notifyDataChange();
};

export const getStoredPlans = () => {
  const data = localStorage.getItem("ngg_plans");
  if (data) {
    try { return JSON.parse(data); } catch {}
  }
  return DEFAULT_PLANS;
};

export const saveStoredPlans = (items) => {
  localStorage.setItem("ngg_plans", JSON.stringify(items));
  localStorage.setItem("ngg_plans_customized", "true");
  notifyDataChange();
};

export const resetWebsiteData = () => {
  localStorage.removeItem("ngg_programs");
  localStorage.removeItem("ngg_trainers");
  localStorage.removeItem("ngg_plans");
  localStorage.removeItem("ngg_reviews");
  localStorage.removeItem("ngg_programs_customized");
  localStorage.removeItem("ngg_trainers_customized");
  localStorage.removeItem("ngg_plans_customized");
  localStorage.removeItem("ngg_reviews_customized");
  notifyDataChange();
  return {
    programs: DEFAULT_PROGRAMS,
    trainers: DEFAULT_TRAINERS,
    plans: DEFAULT_PLANS,
    reviews: DEFAULT_REVIEWS,
  };
};

// Programs API
export const getPrograms = async () => {
  try {
    const res = await api.get("/programs");
    if (Array.isArray(res.data) && res.data.length > 0) {
      localStorage.setItem("ngg_programs", JSON.stringify(res.data));
      notifyDataChange();
      return res.data;
    }
  } catch {}
  return getStoredPrograms();
};

export const createProgram = async (data) => {
  let created;
  try {
    const res = await api.post("/programs", data);
    created = res.data;
  } catch {
    created = { ...data, _id: "prog-" + Date.now() };
  }
  const current = getStoredPrograms();
  const updated = [...current, created];
  saveStoredPrograms(updated);
  return created;
};

export const updateProgram = async (id, data) => {
  let updated;
  try {
    const res = await api.put(`/programs/${id}`, data);
    updated = res.data;
  } catch {
    updated = { ...data, _id: id };
  }
  const current = getStoredPrograms();
  const list = current.map((p) => (p._id === id ? { ...p, ...updated } : p));
  saveStoredPrograms(list);
  return updated;
};

export const deleteProgram = async (id) => {
  try { await api.delete(`/programs/${id}`); } catch {}
  const current = getStoredPrograms();
  const list = current.filter((p) => p._id !== id);
  saveStoredPrograms(list);
  return { message: "Deleted" };
};

// Trainers API
export const getTrainers = async () => {
  try {
    const res = await api.get("/trainers");
    if (Array.isArray(res.data) && res.data.length > 0) {
      localStorage.setItem("ngg_trainers", JSON.stringify(res.data));
      notifyDataChange();
      return res.data;
    }
  } catch {}
  return getStoredTrainers();
};

export const createTrainer = async (data) => {
  let created;
  try {
    const res = await api.post("/trainers", data);
    created = res.data;
  } catch {
    created = { ...data, _id: "tr-" + Date.now() };
  }
  const current = getStoredTrainers();
  const updated = [...current, created];
  saveStoredTrainers(updated);
  return created;
};

export const updateTrainer = async (id, data) => {
  let updated;
  try {
    const res = await api.put(`/trainers/${id}`, data);
    updated = res.data;
  } catch {
    updated = { ...data, _id: id };
  }
  const current = getStoredTrainers();
  const list = current.map((t) => (t._id === id ? { ...t, ...updated } : t));
  saveStoredTrainers(list);
  return updated;
};

export const deleteTrainer = async (id) => {
  try { await api.delete(`/trainers/${id}`); } catch {}
  const current = getStoredTrainers();
  const list = current.filter((t) => t._id !== id);
  saveStoredTrainers(list);
  return { message: "Deleted" };
};

// Plans API
export const getPlans = async () => {
  try {
    const res = await api.get("/plans");
    if (Array.isArray(res.data) && res.data.length > 0) {
      localStorage.setItem("ngg_plans", JSON.stringify(res.data));
      notifyDataChange();
      return res.data;
    }
  } catch {}
  return getStoredPlans();
};

export const createPlan = async (data) => {
  let created;
  try {
    const res = await api.post("/plans", data);
    created = res.data;
  } catch {
    created = { ...data, _id: "plan-" + Date.now() };
  }
  const current = getStoredPlans();
  const updated = [...current, created];
  saveStoredPlans(updated);
  return created;
};

export const updatePlan = async (id, data) => {
  let updated;
  try {
    const res = await api.put(`/plans/${id}`, data);
    updated = res.data;
  } catch {
    updated = { ...data, _id: id };
  }
  const current = getStoredPlans();
  const list = current.map((p) => (p._id === id || p.key === updated.key ? { ...p, ...updated } : p));
  saveStoredPlans(list);
  return updated;
};

export const deletePlan = async (id) => {
  try { await api.delete(`/plans/${id}`); } catch {}
  const current = getStoredPlans();
  const list = current.filter((p) => p._id !== id && p.key !== id);
  saveStoredPlans(list);
  return { message: "Deleted" };
};

// Auth & Users
export const login = (email, password) =>
  api.post("/auth/login", { email, password }).then((r) => r.data);

export const register = (name, email, password) =>
  api.post("/auth/register", { name, email, password }).then((r) => r.data);

export const getMe = () => api.get("/auth/me").then((r) => r.data);

export const getUsers = async () => {
  try {
    const res = await api.get("/auth/users");
    if (Array.isArray(res.data)) return res.data;
  } catch {}
  return [
    { _id: "u1", name: "Gold Admin", email: "newgold@admin.com", role: "admin", createdAt: new Date() },
    { _id: "u2", name: "Simran Kaur", email: "simran@gmail.com", role: "member", createdAt: new Date() },
    { _id: "u3", name: "Vikram Singh", email: "vikram@gmail.com", role: "member", createdAt: new Date() },
  ];
};

export const deleteUser = (id) => api.delete(`/auth/users/${id}`).then((r) => r.data);

// Leads API
export const createLead = async (payload) => {
  try {
    const res = await api.post("/leads", payload);
    return res.data;
  } catch {
    const newLead = { ...payload, _id: "lead-" + Date.now(), status: "new", createdAt: new Date() };
    const saved = localStorage.getItem("ngg_leads");
    const leads = saved ? JSON.parse(saved) : [];
    localStorage.setItem("ngg_leads", JSON.stringify([newLead, ...leads]));
    return newLead;
  }
};

export const getLeads = async (params) => {
  try {
    const res = await api.get("/leads", { params });
    const data = res.data.leads || res.data;
    if (Array.isArray(data) && data.length > 0) return data;
  } catch {}
  const saved = localStorage.getItem("ngg_leads");
  if (saved) {
    try { return JSON.parse(saved); } catch {}
  }
  return [
    { _id: "l1", name: "Rahul Sharma", phone: "+91 98765 43210", email: "rahul@gmail.com", plan: "gold", status: "new", createdAt: new Date() },
    { _id: "l2", name: "Ananya Roy", phone: "+91 91234 56789", email: "ananya@gmail.com", plan: "elite", status: "contacted", createdAt: new Date() },
    { _id: "l3", name: "Kabir Malhotra", phone: "+91 99887 76655", email: "kabir@gmail.com", plan: "basic", status: "converted", createdAt: new Date() },
  ];
};

export const updateLeadStatus = async (id, status) => {
  try {
    const res = await api.patch(`/leads/${id}`, { status });
    return res.data;
  } catch {
    const saved = localStorage.getItem("ngg_leads");
    const leads = saved ? JSON.parse(saved) : [];
    const updated = leads.map((l) => (l._id === id ? { ...l, status } : l));
    localStorage.setItem("ngg_leads", JSON.stringify(updated));
    return { _id: id, status };
  }
};

export const deleteLead = async (id) => {
  try { await api.delete(`/leads/${id}`); } catch {}
  const saved = localStorage.getItem("ngg_leads");
  if (saved) {
    const leads = JSON.parse(saved).filter((l) => l._id !== id);
    localStorage.setItem("ngg_leads", JSON.stringify(leads));
  }
  return { message: "Deleted" };
};

export const DEFAULT_REVIEWS = [
  { _id: "rev-1", name: "Kavya Desai", rating: 5, role: "Member since 2024", comment: "I walked in unable to do a single pull-up. Ten months later I deadlift twice my bodyweight.", status: "approved", createdAt: new Date() },
  { _id: "rev-2", name: "Rahul Sharma", rating: 5, role: "Powerlifting Athlete", comment: "Best gym equipment and coaching atmosphere in Surat. Staff is super supportive and knowledgeable.", status: "approved", createdAt: new Date() },
  { _id: "rev-3", name: "Ananya Patel", rating: 5, role: "CrossFit Member", comment: "Clean space, top quality dumbbells, and unbeatable energy every morning. Highly recommended!", status: "approved", createdAt: new Date() },
];

export const getStoredReviews = () => {
  const data = localStorage.getItem("ngg_reviews");
  if (data) {
    try { return JSON.parse(data); } catch {}
  }
  return DEFAULT_REVIEWS;
};

export const saveStoredReviews = (items) => {
  localStorage.setItem("ngg_reviews", JSON.stringify(items));
  localStorage.setItem("ngg_reviews_customized", "true");
  notifyDataChange();
};

export const getReviews = async (params) => {
  try {
    const res = await api.get("/reviews", { params });
    if (Array.isArray(res.data) && res.data.length > 0) {
      localStorage.setItem("ngg_reviews", JSON.stringify(res.data));
      notifyDataChange();
      return res.data;
    }
  } catch {}
  return getStoredReviews();
};

export const createReview = async (payload) => {
  let created;
  try {
    const res = await api.post("/reviews", payload);
    created = res.data;
  } catch {
    created = { ...payload, _id: "rev-" + Date.now(), status: "approved", createdAt: new Date() };
  }
  const current = getStoredReviews();
  const updated = [created, ...current];
  saveStoredReviews(updated);
  return created;
};

export const updateReviewStatus = async (id, status) => {
  try { await api.patch(`/reviews/${id}`, { status }); } catch {}
  const current = getStoredReviews();
  const list = current.map((r) => (r._id === id ? { ...r, status } : r));
  saveStoredReviews(list);
  return { _id: id, status };
};

export const deleteReview = async (id) => {
  try { await api.delete(`/reviews/${id}`); } catch {}
  const current = getStoredReviews();
  const list = current.filter((r) => r._id !== id);
  saveStoredReviews(list);
  return { message: "Deleted" };
};

export const getStats = async () => {
  try {
    const res = await api.get("/stats");
    return res.data;
  } catch {
    const progs = getStoredPrograms();
    const trs = getStoredTrainers();
    const pls = getStoredPlans();
    const lds = await getLeads();
    const revs = getStoredReviews();
    return {
      totalLeads: lds.length,
      newLeads: lds.filter((l) => l.status === "new").length,
      programs: progs.length,
      trainers: trs.length,
      plans: pls.length,
      reviews: revs.length,
    };
  }
};

export default api;
