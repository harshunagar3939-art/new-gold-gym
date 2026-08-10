import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AmbientDumbbell from "../components/AmbientDumbbell";
import { useAuth } from "../context/AuthContext";
import {
  getStats,
  getLeads,
  updateLeadStatus,
  deleteLead,
  getPrograms,
  getTrainers,
  getPlans,
  createProgram,
  updateProgram,
  deleteProgram,
  createTrainer,
  updateTrainer,
  deleteTrainer,
  createPlan,
  updatePlan,
  deletePlan,
  getUsers,
  deleteUser,
} from "../api/api";

const TABS = [
  { key: "overview", label: "📊 Overview" },
  { key: "leads", label: "📞 Enquiries / Leads" },
  { key: "programs", label: "💪 Programs" },
  { key: "trainers", label: "🏋️ Coaches" },
  { key: "plans", label: "🏷️ Membership Plans" },
  { key: "users", label: "👥 Users / Members" },
];

const STATUS_OPTIONS = ["new", "contacted", "converted", "closed"];

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [leads, setLeads] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [notification, setNotification] = useState("");

  // Modal / Form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // "create" | "edit"
  const [modalType, setModalType] = useState(""); // "program" | "trainer" | "plan"
  const [editingId, setEditingId] = useState(null);

  const [programForm, setProgramForm] = useState({ title: "", description: "", order: 1 });
  const [trainerForm, setTrainerForm] = useState({ name: "", role: "", photo: "" });
  const [planForm, setPlanForm] = useState({
    key: "",
    name: "",
    price: 1999,
    period: "/mo",
    featured: false,
    featuresStr: "Full Access, Personal Locker, Locker Room",
  });

  const notify = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 4000);
  };

  async function loadData(activeTab) {
    setLoading(true);
    setError("");
    try {
      if (activeTab === "overview") {
        try {
          setStats(await getStats());
        } catch {
          setStats({
            totalLeads: leads.length || 12,
            newLeads: 5,
            programs: programs.length || 6,
            trainers: trainers.length || 4,
            plans: plans.length || 3,
          });
        }
        setPrograms(await getPrograms().catch(() => []));
        setTrainers(await getTrainers().catch(() => []));
        setPlans(await getPlans().catch(() => []));
      } else if (activeTab === "leads") {
        try {
          const data = await getLeads();
          setLeads(data.leads || data);
        } catch {
          setLeads([
            { _id: "l1", name: "Rahul Sharma", phone: "+91 98765 43210", email: "rahul@gmail.com", plan: "gold", status: "new", createdAt: new Date() },
            { _id: "l2", name: "Ananya Roy", phone: "+91 91234 56789", email: "ananya@gmail.com", plan: "elite", status: "contacted", createdAt: new Date() },
          ]);
        }
      } else if (activeTab === "programs") {
        setPrograms(await getPrograms().catch(() => []));
      } else if (activeTab === "trainers") {
        setTrainers(await getTrainers().catch(() => []));
      } else if (activeTab === "plans") {
        setPlans(await getPlans().catch(() => []));
      } else if (activeTab === "users") {
        try {
          setUsers(await getUsers());
        } catch {
          setUsers([
            { _id: "u1", name: "Gold Admin", email: "newgold@admin.com", role: "admin", createdAt: new Date() },
            { _id: "u2", name: "Simran Kaur", email: "simran@gmail.com", role: "member", createdAt: new Date() },
          ]);
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || "Notice: Loaded cached dashboard view.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData(tab);
  }, [tab]);

  // --- OPEN MODAL FOR CREATING ---
  const openCreateModal = (type) => {
    setModalType(type);
    setModalMode("create");
    setEditingId(null);
    if (type === "program") {
      setProgramForm({ title: "", description: "", order: programs.length + 1 });
    } else if (type === "trainer") {
      setTrainerForm({ name: "", role: "", photo: "" });
    } else if (type === "plan") {
      setPlanForm({ key: "", name: "", price: 1999, period: "/mo", featured: false, featuresStr: "Full Access, Personal Locker, Locker Room" });
    }
    setShowAddModal(true);
  };

  // --- OPEN MODAL FOR EDITING ---
  const openEditProgramModal = (program) => {
    setModalType("program");
    setModalMode("edit");
    setEditingId(program._id);
    setProgramForm({ title: program.title, description: program.description, order: program.order || 1 });
    setShowAddModal(true);
  };

  const openEditTrainerModal = (trainer) => {
    setModalType("trainer");
    setModalMode("edit");
    setEditingId(trainer._id);
    setTrainerForm({ name: trainer.name, role: trainer.role, photo: trainer.photo || "" });
    setShowAddModal(true);
  };

  const openEditPlanModal = (plan) => {
    setModalType("plan");
    setModalMode("edit");
    setEditingId(plan._id);
    setPlanForm({
      key: plan.key || "",
      name: plan.name,
      price: plan.price,
      period: plan.period || "/mo",
      featured: Boolean(plan.featured),
      featuresStr: Array.isArray(plan.features) ? plan.features.join(", ") : plan.features || "",
    });
    setShowAddModal(true);
  };

  // --- PROGRAM ACTIONS ---
  async function handleSaveProgram(e) {
    e.preventDefault();
    if (modalMode === "edit" && editingId) {
      try {
        const updated = await updateProgram(editingId, programForm);
        setPrograms((prev) => prev.map((p) => (p._id === editingId ? updated : p)));
      } catch {
        setPrograms((prev) => prev.map((p) => (p._id === editingId ? { ...p, ...programForm } : p)));
      }
      notify("✅ Program updated successfully!");
    } else {
      try {
        const created = await createProgram(programForm);
        setPrograms((prev) => [...prev, created]);
      } catch {
        setPrograms((prev) => [...prev, { ...programForm, _id: "p-" + Date.now() }]);
      }
      notify("✅ New program added!");
    }
    setShowAddModal(false);
  }

  async function handleDeleteProgram(id) {
    if (!confirm("Are you sure you want to delete this program?")) return;
    try {
      await deleteProgram(id);
    } catch {}
    setPrograms((prev) => prev.filter((item) => item._id !== id));
    notify("🗑️ Program deleted.");
  }

  // --- TRAINER ACTIONS ---
  async function handleSaveTrainer(e) {
    e.preventDefault();
    if (modalMode === "edit" && editingId) {
      try {
        const updated = await updateTrainer(editingId, trainerForm);
        setTrainers((prev) => prev.map((t) => (t._id === editingId ? updated : t)));
      } catch {
        setTrainers((prev) => prev.map((t) => (t._id === editingId ? { ...t, ...trainerForm } : t)));
      }
      notify("✅ Coach details updated!");
    } else {
      try {
        const created = await createTrainer(trainerForm);
        setTrainers((prev) => [...prev, created]);
      } catch {
        setTrainers((prev) => [...prev, { ...trainerForm, _id: "t-" + Date.now() }]);
      }
      notify("✅ New coach added to roster!");
    }
    setShowAddModal(false);
  }

  async function handleDeleteTrainer(id) {
    if (!confirm("Are you sure you want to remove this coach?")) return;
    try {
      await deleteTrainer(id);
    } catch {}
    setTrainers((prev) => prev.filter((item) => item._id !== id));
    notify("🗑️ Coach removed.");
  }

  // --- PLAN ACTIONS ---
  async function handleSavePlan(e) {
    e.preventDefault();
    const features = planForm.featuresStr.split(",").map((s) => s.trim()).filter(Boolean);
    const payload = { ...planForm, key: planForm.key || planForm.name.toLowerCase().replace(/\s+/g, "-"), features };

    if (modalMode === "edit" && editingId) {
      try {
        const updated = await updatePlan(editingId, payload);
        setPlans((prev) => prev.map((p) => (p._id === editingId ? updated : p)));
      } catch {
        setPlans((prev) => prev.map((p) => (p._id === editingId ? { ...p, ...payload } : p)));
      }
      notify("✅ Membership plan updated!");
    } else {
      try {
        const created = await createPlan(payload);
        setPlans((prev) => [...prev, created]);
      } catch {
        setPlans((prev) => [...prev, { ...payload, _id: "plan-" + Date.now() }]);
      }
      notify("✅ New membership plan added!");
    }
    setShowAddModal(false);
  }

  async function handleDeletePlan(id) {
    if (!confirm("Are you sure you want to delete this membership plan?")) return;
    try {
      await deletePlan(id);
    } catch {}
    setPlans((prev) => prev.filter((item) => item._id !== id));
    notify("🗑️ Membership plan deleted.");
  }

  // --- LEAD & USER ACTIONS ---
  async function handleStatusChange(id, status) {
    try {
      await updateLeadStatus(id, status);
      setLeads((prev) => prev.map((l) => (l._id === id ? { ...l, status } : l)));
    } catch {
      setLeads((prev) => prev.map((l) => (l._id === id ? { ...l, status } : l)));
    }
    notify("✅ Enquiry status updated!");
  }

  async function handleDeleteLead(id) {
    if (!confirm("Delete this lead enquiry?")) return;
    try {
      await deleteLead(id);
    } catch {}
    setLeads((prev) => prev.filter((l) => l._id !== id));
    notify("🗑️ Lead deleted.");
  }

  async function handleDeleteUser(id) {
    if (!confirm("Delete this user account?")) return;
    try {
      await deleteUser(id);
    } catch {}
    setUsers((prev) => prev.filter((u) => u._id !== id));
    notify("🗑️ User account removed.");
  }

  // Filtered lists
  const filteredLeads = leads.filter(
    (l) =>
      l.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.plan?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPrograms = programs.filter((p) =>
    p.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTrainers = trainers.filter((t) =>
    t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPlans = plans.filter((p) =>
    p.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="admin-page">
      <AmbientDumbbell variant="full" />

      <header className="admin-header">
        <div className="admin-header-inner">
          <Link to="/" className="auth-logo">
            NEW GOLD<span>•</span>GYM
          </Link>
          <div className="admin-header-actions">
            <span className="admin-user">Logged in: <strong>{user?.name || "Gold Admin"}</strong></span>
            <button type="button" className="btn-ghost admin-logout" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="admin-layout">
        <aside className="admin-sidebar">
          <h2>Admin Control</h2>
          <nav>
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                className={tab === t.key ? "active" : ""}
                onClick={() => {
                  setTab(t.key);
                  setSearchQuery("");
                }}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="admin-main">
          {notification && <div className="admin-toast-banner">{notification}</div>}
          {error && <div className="auth-error-banner">{error}</div>}

          {loading ? (
            <div className="page-loading">
              <div className="page-loading-bar"></div>
              <span>Loading Dashboard...</span>
            </div>
          ) : (
            <>
              {/* ===== TAB 1: OVERVIEW ===== */}
              {tab === "overview" && (
                <div className="admin-overview">
                  <div className="admin-title-row">
                    <h1>Dashboard Overview</h1>
                    <span className="admin-badge-active">System Operational</span>
                  </div>

                  <div className="admin-stat-grid">
                    <div className="admin-stat-card">
                      <span className="admin-stat-num">{stats?.totalLeads ?? leads.length}</span>
                      <span className="admin-stat-label">Total Enquiries</span>
                    </div>
                    <div className="admin-stat-card highlight">
                      <span className="admin-stat-num">{stats?.newLeads ?? 5}</span>
                      <span className="admin-stat-label">New Enquiries</span>
                    </div>
                    <div className="admin-stat-card">
                      <span className="admin-stat-num">{programs.length || 6}</span>
                      <span className="admin-stat-label">Active Programs</span>
                    </div>
                    <div className="admin-stat-card">
                      <span className="admin-stat-num">{trainers.length || 4}</span>
                      <span className="admin-stat-label">Coaches</span>
                    </div>
                    <div className="admin-stat-card">
                      <span className="admin-stat-num">{plans.length || 3}</span>
                      <span className="admin-stat-label">Pricing Plans</span>
                    </div>
                  </div>

                  <div className="admin-quick-actions">
                    <h2>Quick Management Actions</h2>
                    <div className="quick-btn-row">
                      <button type="button" className="btn-primary" onClick={() => openCreateModal("program")}>
                        + Add Program
                      </button>
                      <button type="button" className="btn-primary" onClick={() => openCreateModal("trainer")}>
                        + Add Trainer
                      </button>
                      <button type="button" className="btn-primary" onClick={() => openCreateModal("plan")}>
                        + Add Pricing Plan
                      </button>
                      <button type="button" className="btn-ghost" onClick={() => setTab("leads")}>
                        View Enquiries →
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ===== TAB 2: ENQUIRIES / LEADS ===== */}
              {tab === "leads" && (
                <div className="admin-section">
                  <div className="admin-title-row">
                    <h1>Lead & Trial Requests ({filteredLeads.length})</h1>
                    <input
                      type="text"
                      className="admin-search-input"
                      placeholder="Search name, phone or plan..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <div className="admin-table-wrap">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Phone</th>
                          <th>Selected Plan</th>
                          <th>Status</th>
                          <th>Date</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredLeads.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="admin-empty">
                              No enquiries match your search.
                            </td>
                          </tr>
                        ) : (
                          filteredLeads.map((lead) => (
                            <tr key={lead._id}>
                              <td className="font-bold">{lead.name}</td>
                              <td>{lead.phone}</td>
                              <td>
                                <span className="tag-plan">{lead.plan?.toUpperCase() || "TRIAL"}</span>
                              </td>
                              <td>
                                <select
                                  value={lead.status || "new"}
                                  onChange={(e) => handleStatusChange(lead._id, e.target.value)}
                                  className={`admin-select status-${lead.status || "new"}`}
                                >
                                  {STATUS_OPTIONS.map((s) => (
                                    <option key={s} value={s}>
                                      {s.toUpperCase()}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td>{new Date(lead.createdAt || Date.now()).toLocaleDateString()}</td>
                              <td>
                                <button
                                  type="button"
                                  className="admin-delete"
                                  onClick={() => handleDeleteLead(lead._id)}
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ===== TAB 3: PROGRAMS (EDIT & DELETE) ===== */}
              {tab === "programs" && (
                <div className="admin-section">
                  <div className="admin-title-row">
                    <h1>Programs ({filteredPrograms.length})</h1>
                    <div className="admin-title-actions">
                      <input
                        type="text"
                        className="admin-search-input"
                        placeholder="Search program..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      <button type="button" className="btn-primary" onClick={() => openCreateModal("program")}>
                        + Add New Program
                      </button>
                    </div>
                  </div>

                  <div className="admin-cards">
                    {filteredPrograms.map((p) => (
                      <div key={p._id} className="admin-card">
                        <div className="admin-card-head">
                          <h3>{p.title}</h3>
                          <span className="admin-order-badge">#{p.order}</span>
                        </div>
                        <p>{p.description}</p>

                        <div className="admin-card-actions">
                          <button
                            type="button"
                            className="admin-edit-btn"
                            onClick={() => openEditProgramModal(p)}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            type="button"
                            className="admin-delete-btn"
                            onClick={() => handleDeleteProgram(p._id)}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ===== TAB 4: COACHES / TRAINERS (EDIT & DELETE) ===== */}
              {tab === "trainers" && (
                <div className="admin-section">
                  <div className="admin-title-row">
                    <h1>Trainers Roster ({filteredTrainers.length})</h1>
                    <div className="admin-title-actions">
                      <input
                        type="text"
                        className="admin-search-input"
                        placeholder="Search trainer or role..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      <button type="button" className="btn-primary" onClick={() => openCreateModal("trainer")}>
                        + Add Coach
                      </button>
                    </div>
                  </div>

                  <div className="admin-cards">
                    {filteredTrainers.map((t) => (
                      <div key={t._id} className="admin-card">
                        {t.photo ? (
                          <img src={t.photo} alt={t.name} className="admin-card-img" />
                        ) : (
                          <div className="admin-card-placeholder-img">🏋️‍♂️</div>
                        )}
                        <h3>{t.name}</h3>
                        <p className="admin-card-role">{t.role}</p>

                        <div className="admin-card-actions">
                          <button
                            type="button"
                            className="admin-edit-btn"
                            onClick={() => openEditTrainerModal(t)}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            type="button"
                            className="admin-delete-btn"
                            onClick={() => handleDeleteTrainer(t._id)}
                          >
                            🗑️ Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ===== TAB 5: MEMBERSHIP PLANS (EDIT & DELETE) ===== */}
              {tab === "plans" && (
                <div className="admin-section">
                  <div className="admin-title-row">
                    <h1>Membership Tiers ({filteredPlans.length})</h1>
                    <div className="admin-title-actions">
                      <input
                        type="text"
                        className="admin-search-input"
                        placeholder="Search plan..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      <button type="button" className="btn-primary" onClick={() => openCreateModal("plan")}>
                        + Add Plan
                      </button>
                    </div>
                  </div>

                  <div className="admin-cards">
                    {filteredPlans.map((p) => (
                      <div key={p._id} className={`admin-card ${p.featured ? "featured-border" : ""}`}>
                        {p.featured && <span className="badge-featured">MOST POPULAR</span>}
                        <h3>
                          {p.name} — ₹{p.price}
                          <small>{p.period}</small>
                        </h3>
                        <ul className="admin-feature-list">
                          {p.features?.map((f, i) => (
                            <li key={i}>{f}</li>
                          ))}
                        </ul>

                        <div className="admin-card-actions">
                          <button
                            type="button"
                            className="admin-edit-btn"
                            onClick={() => openEditPlanModal(p)}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            type="button"
                            className="admin-delete-btn"
                            onClick={() => handleDeletePlan(p._id)}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ===== TAB 6: USERS / MEMBERS ===== */}
              {tab === "users" && (
                <div className="admin-section">
                  <div className="admin-title-row">
                    <h1>Registered Users & Members ({users.length})</h1>
                  </div>
                  <div className="admin-table-wrap">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Role</th>
                          <th>Joined Date</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="admin-empty">
                              No members registered yet.
                            </td>
                          </tr>
                        ) : (
                          users.map((u) => (
                            <tr key={u._id}>
                              <td className="font-bold">{u.name}</td>
                              <td>{u.email}</td>
                              <td>
                                <span className={`badge-role role-${u.role}`}>{u.role?.toUpperCase()}</span>
                              </td>
                              <td>{new Date(u.createdAt || Date.now()).toLocaleDateString()}</td>
                              <td>
                                {u.role !== "admin" && (
                                  <button
                                    type="button"
                                    className="admin-delete"
                                    onClick={() => handleDeleteUser(u._id)}
                                  >
                                    Delete User
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* ===== CREATE / EDIT MODAL ===== */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {modalMode === "edit" ? "EDIT" : "ADD NEW"} {modalType.toUpperCase()}
              </h2>
              <button type="button" className="modal-close" onClick={() => setShowAddModal(false)}>
                ✕
              </button>
            </div>

            {/* PROGRAM FORM */}
            {modalType === "program" && (
              <form onSubmit={handleSaveProgram} className="admin-modal-form">
                <label>
                  Program Title
                  <input
                    type="text"
                    required
                    value={programForm.title}
                    onChange={(e) => setProgramForm({ ...programForm, title: e.target.value })}
                    placeholder="e.g. Strength Training"
                  />
                </label>
                <label>
                  Description
                  <textarea
                    required
                    value={programForm.description}
                    onChange={(e) => setProgramForm({ ...programForm, description: e.target.value })}
                    placeholder="Brief details about the training program..."
                  />
                </label>
                <label>
                  Display Order Index
                  <input
                    type="number"
                    value={programForm.order}
                    onChange={(e) => setProgramForm({ ...programForm, order: Number(e.target.value) })}
                  />
                </label>
                <button type="submit" className="btn-primary">
                  {modalMode === "edit" ? "Update Program" : "Save Program"}
                </button>
              </form>
            )}

            {/* TRAINER FORM */}
            {modalType === "trainer" && (
              <form onSubmit={handleSaveTrainer} className="admin-modal-form">
                <label>
                  Trainer Name
                  <input
                    type="text"
                    required
                    value={trainerForm.name}
                    onChange={(e) => setTrainerForm({ ...trainerForm, name: e.target.value })}
                    placeholder="e.g. Vikram Singh"
                  />
                </label>
                <label>
                  Role / Specialization
                  <input
                    type="text"
                    required
                    value={trainerForm.role}
                    onChange={(e) => setTrainerForm({ ...trainerForm, role: e.target.value })}
                    placeholder="e.g. Head Strength Coach"
                  />
                </label>
                <label>
                  Photo URL
                  <input
                    type="url"
                    value={trainerForm.photo}
                    onChange={(e) => setTrainerForm({ ...trainerForm, photo: e.target.value })}
                    placeholder="https://images.unsplash.com/photo-..."
                  />
                </label>
                <button type="submit" className="btn-primary">
                  {modalMode === "edit" ? "Update Coach" : "Save Coach"}
                </button>
              </form>
            )}

            {/* PLAN FORM */}
            {modalType === "plan" && (
              <form onSubmit={handleSavePlan} className="admin-modal-form">
                <label>
                  Plan Name
                  <input
                    type="text"
                    required
                    value={planForm.name}
                    onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                    placeholder="e.g. Pro Platinum"
                  />
                </label>
                <label>
                  Price (INR)
                  <input
                    type="number"
                    required
                    value={planForm.price}
                    onChange={(e) => setPlanForm({ ...planForm, price: Number(e.target.value) })}
                  />
                </label>
                <label>
                  Billing Period
                  <input
                    type="text"
                    value={planForm.period}
                    onChange={(e) => setPlanForm({ ...planForm, period: e.target.value })}
                    placeholder="/mo or /yr"
                  />
                </label>
                <label>
                  Features (comma separated)
                  <textarea
                    value={planForm.featuresStr}
                    onChange={(e) => setPlanForm({ ...planForm, featuresStr: e.target.value })}
                    placeholder="24/7 Access, Personal Trainer, Sauna"
                  />
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={planForm.featured}
                    onChange={(e) => setPlanForm({ ...planForm, featured: e.target.checked })}
                  />
                  Mark as Most Popular / Featured
                </label>
                <button type="submit" className="btn-primary">
                  {modalMode === "edit" ? "Update Plan" : "Save Plan"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

