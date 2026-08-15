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
  getReviews,
  createReview,
  updateReviewStatus,
  deleteReview,
  resetWebsiteData,
} from "../api/api";

const TABS = [
  { key: "overview", label: "📊 Overview" },
  { key: "leads", label: "📞 Enquiries / Leads" },
  { key: "programs", label: "💪 Programs" },
  { key: "trainers", label: "🏋️ Coaches" },
  { key: "plans", label: "🏷️ Membership Plans" },
  { key: "reviews", label: "⭐ Customer Reviews" },
  { key: "users", label: "👥 Users / Members" },
];

const STATUS_OPTIONS = ["new", "contacted", "converted", "closed"];
const REVIEW_STATUS_OPTIONS = ["approved", "pending"];

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [leads, setLeads] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [leadStatusFilter, setLeadStatusFilter] = useState("all");
  const [notification, setNotification] = useState("");

  // Modal / Form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // "create" | "edit"
  const [modalType, setModalType] = useState(""); // "program" | "trainer" | "plan" | "review"
  const [editingId, setEditingId] = useState(null);

  const [programForm, setProgramForm] = useState({ title: "", description: "", order: 1 });
  const [trainerForm, setTrainerForm] = useState({ name: "", role: "", photo: "" });
  const [planForm, setPlanForm] = useState({
    key: "",
    name: "",
    price: 1999,
    period: "/Yr",
    featured: false,
    featuresStr: "Full Access, Personal Locker, Locker Room",
  });
  const [reviewForm, setReviewForm] = useState({
    name: "",
    rating: 5,
    role: "Member",
    comment: "",
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
            totalLeads: leads.length || 3,
            newLeads: 1,
            programs: programs.length || 6,
            trainers: trainers.length || 4,
            plans: plans.length || 3,
            reviews: reviews.length || 3,
          });
        }
        setPrograms(await getPrograms());
        setTrainers(await getTrainers());
        setPlans(await getPlans());
        setLeads(await getLeads());
        setReviews(await getReviews());
      } else if (activeTab === "leads") {
        setLeads(await getLeads());
      } else if (activeTab === "programs") {
        setPrograms(await getPrograms());
      } else if (activeTab === "trainers") {
        setTrainers(await getTrainers());
      } else if (activeTab === "plans") {
        setPlans(await getPlans());
      } else if (activeTab === "reviews") {
        setReviews(await getReviews());
      } else if (activeTab === "users") {
        setUsers(await getUsers());
      }
    } catch (err) {
      setError(err.response?.data?.error || "Notice: Loaded cached dashboard data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData(tab);
  }, [tab]);

  // Reset website data to default fallback
  const handleResetData = () => {
    if (!window.confirm("Are you sure you want to reset website content (Programs, Coaches, Plans, Reviews) to initial defaults?")) return;
    const restored = resetWebsiteData();
    setPrograms(restored.programs);
    setTrainers(restored.trainers);
    setPlans(restored.plans);
    if (restored.reviews) setReviews(restored.reviews);
    notify("🔄 Website content reset to initial default settings!");
  };

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
      setPlanForm({ key: "", name: "", price: 2500, period: "/Yr", featured: false, featuresStr: "Full Access, Personal Locker, Locker Room" });
    } else if (type === "review") {
      setReviewForm({ name: "", rating: 5, role: "Member", comment: "" });
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
    setEditingId(plan._id || plan.key);
    setPlanForm({
      key: plan.key || "",
      name: plan.name,
      price: plan.price,
      period: plan.period || "/Yr",
      featured: Boolean(plan.featured),
      featuresStr: Array.isArray(plan.features) ? plan.features.join(", ") : plan.features || "",
    });
    setShowAddModal(true);
  };

  // --- PROGRAM ACTIONS ---
  async function handleSaveProgram(e) {
    e.preventDefault();
    if (modalMode === "edit" && editingId) {
      const updated = await updateProgram(editingId, programForm);
      setPrograms((prev) => prev.map((p) => (p._id === editingId ? { ...p, ...updated } : p)));
      notify("✅ Program updated successfully!");
    } else {
      const created = await createProgram(programForm);
      setPrograms((prev) => [...prev, created]);
      notify("✅ New program added!");
    }
    setShowAddModal(false);
  }

  async function handleDeleteProgram(id) {
    if (!window.confirm("Are you sure you want to delete this program?")) return;
    await deleteProgram(id);
    setPrograms((prev) => prev.filter((item) => item._id !== id));
    notify("🗑️ Program deleted.");
  }

  // --- TRAINER ACTIONS ---
  async function handleSaveTrainer(e) {
    e.preventDefault();
    if (modalMode === "edit" && editingId) {
      const updated = await updateTrainer(editingId, trainerForm);
      setTrainers((prev) => prev.map((t) => (t._id === editingId ? { ...t, ...updated } : t)));
      notify("✅ Coach details updated!");
    } else {
      const created = await createTrainer(trainerForm);
      setTrainers((prev) => [...prev, created]);
      notify("✅ New coach added to roster!");
    }
    setShowAddModal(false);
  }

  async function handleDeleteTrainer(id) {
    if (!window.confirm("Are you sure you want to remove this coach?")) return;
    await deleteTrainer(id);
    setTrainers((prev) => prev.filter((item) => item._id !== id));
    notify("🗑️ Coach removed.");
  }

  // --- PLAN ACTIONS ---
  async function handleSavePlan(e) {
    e.preventDefault();
    const features = planForm.featuresStr.split(",").map((s) => s.trim()).filter(Boolean);
    const payload = { ...planForm, key: planForm.key || planForm.name.toLowerCase().replace(/\s+/g, "-"), features };

    if (modalMode === "edit" && editingId) {
      const updated = await updatePlan(editingId, payload);
      setPlans((prev) => prev.map((p) => (p._id === editingId || p.key === editingId ? { ...p, ...updated } : p)));
      notify("✅ Membership plan updated!");
    } else {
      const created = await createPlan(payload);
      setPlans((prev) => [...prev, created]);
      notify("✅ New membership plan added!");
    }
    setShowAddModal(false);
  }

  async function handleDeletePlan(id) {
    if (!window.confirm("Are you sure you want to delete this membership plan?")) return;
    await deletePlan(id);
    setPlans((prev) => prev.filter((item) => item._id !== id && item.key !== id));
    notify("🗑️ Membership plan deleted.");
  }

  // --- REVIEW ACTIONS ---
  async function handleSaveReview(e) {
    e.preventDefault();
    const created = await createReview(reviewForm);
    setReviews((prev) => [created, ...prev]);
    notify("⭐ New review added to website!");
    setShowAddModal(false);
  }

  async function handleReviewStatusChange(id, status) {
    await updateReviewStatus(id, status);
    setReviews((prev) => prev.map((r) => (r._id === id ? { ...r, status } : r)));
    notify("✅ Review status updated!");
  }

  async function handleDeleteReview(id) {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    await deleteReview(id);
    setReviews((prev) => prev.filter((r) => r._id !== id));
    notify("🗑️ Review deleted.");
  }

  // --- LEAD & USER ACTIONS ---
  async function handleStatusChange(id, status) {
    await updateLeadStatus(id, status);
    setLeads((prev) => prev.map((l) => (l._id === id ? { ...l, status } : l)));
    notify("✅ Enquiry status updated!");
  }

  async function handleDeleteLead(id) {
    if (!window.confirm("Delete this lead enquiry?")) return;
    await deleteLead(id);
    setLeads((prev) => prev.filter((l) => l._id !== id));
    notify("🗑️ Lead deleted.");
  }

  async function handleDeleteUser(id) {
    if (!window.confirm("Delete this user account?")) return;
    await deleteUser(id);
    setUsers((prev) => prev.filter((u) => u._id !== id));
    notify("🗑️ User account removed.");
  }

  // Handle Trainer Image File Selection (JPG, JPEG, PNG only)
  const handleTrainerImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/jpg", "image/png"];
    const fileNameLower = file.name.toLowerCase();
    const isValidExt = fileNameLower.endsWith(".jpg") || fileNameLower.endsWith(".jpeg") || fileNameLower.endsWith(".png");

    if (!validTypes.includes(file.type) && !isValidExt) {
      alert("❌ Invalid File Format! Only JPG, JPEG, and PNG image files are supported.");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        const maxDim = 800;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const mimeType = file.type === "image/png" ? "image/png" : "image/jpeg";
        const dataUrl = canvas.toDataURL(mimeType, 0.85);
        setTrainerForm((prev) => ({ ...prev, photo: dataUrl }));
        notify(`📷 Selected photo: ${file.name}`);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Filtered lists
  const filteredLeads = leads.filter((l) => {
    const matchesSearch =
      l.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.plan?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = leadStatusFilter === "all" || l.status === leadStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredPrograms = programs.filter((p) =>
    p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTrainers = trainers.filter((t) =>
    t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPlans = plans.filter((p) =>
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.key?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredReviews = reviews.filter((r) =>
    r.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.comment?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = users.filter((u) =>
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role?.toLowerCase().includes(searchQuery.toLowerCase())
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
            <span className="admin-user">
              Logged in: <strong>{user?.name || "Gold Admin"}</strong>
            </span>
            <Link to="/" className="btn-ghost admin-nav-home">
              🌐 Website
            </Link>
            <button type="button" className="btn-ghost admin-logout" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="admin-layout">
        <aside className="admin-sidebar">
          <h2>Admin Control</h2>
          <div className="admin-sidebar-user-badge">
            👤 <span>{user?.name || "Gold Admin"}</span>
          </div>
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
                    <div>
                      <h1>Dashboard Overview</h1>
                      <p className="admin-subtitle">Control and update website content, coaches, plans, reviews & member enquiries.</p>
                    </div>
                    <div className="admin-header-right-btns">
                      <span className="admin-badge-active">● System Live</span>
                      <button type="button" className="btn-ghost btn-reset" onClick={handleResetData} title="Restore website defaults">
                        🔄 Reset Default Content
                      </button>
                    </div>
                  </div>

                  <div className="admin-stat-grid">
                    <div className="admin-stat-card" onClick={() => setTab("leads")}>
                      <span className="admin-stat-num">{leads.length}</span>
                      <span className="admin-stat-label">Total Enquiries</span>
                    </div>
                    <div className="admin-stat-card highlight" onClick={() => setTab("leads")}>
                      <span className="admin-stat-num">{leads.filter((l) => l.status === "new").length}</span>
                      <span className="admin-stat-label">New Enquiries</span>
                    </div>
                    <div className="admin-stat-card" onClick={() => setTab("programs")}>
                      <span className="admin-stat-num">{programs.length}</span>
                      <span className="admin-stat-label">Programs</span>
                    </div>
                    <div className="admin-stat-card" onClick={() => setTab("trainers")}>
                      <span className="admin-stat-num">{trainers.length}</span>
                      <span className="admin-stat-label">Coaches</span>
                    </div>
                    <div className="admin-stat-card" onClick={() => setTab("plans")}>
                      <span className="admin-stat-num">{plans.length}</span>
                      <span className="admin-stat-label">Membership Plans</span>
                    </div>
                    <div className="admin-stat-card" onClick={() => setTab("reviews")}>
                      <span className="admin-stat-num">{reviews.length}</span>
                      <span className="admin-stat-label">User Reviews</span>
                    </div>
                  </div>

                  <div className="admin-quick-actions">
                    <h2>Quick Actions</h2>
                    <div className="quick-btn-row">
                      <button type="button" className="btn-primary" onClick={() => openCreateModal("program")}>
                        + Add Program
                      </button>
                      <button type="button" className="btn-primary" onClick={() => openCreateModal("trainer")}>
                        + Add Coach
                      </button>
                      <button type="button" className="btn-primary" onClick={() => openCreateModal("plan")}>
                        + Add Plan
                      </button>
                      <button type="button" className="btn-primary" onClick={() => openCreateModal("review")}>
                        + Add Review
                      </button>
                    </div>
                  </div>

                  {/* RECENT ENQUIRIES PREVIEW */}
                  <div className="admin-recent-section">
                    <h2>Recent Enquiries</h2>
                    {leads.length === 0 ? (
                      <div className="admin-empty">No member enquiries submitted yet.</div>
                    ) : (
                      <div className="admin-table-wrap">
                        <table className="admin-table">
                          <thead>
                            <tr>
                              <th>Name</th>
                              <th>Contact</th>
                              <th>Plan</th>
                              <th>Status</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {leads.slice(0, 5).map((l) => (
                              <tr key={l._id}>
                                <td className="font-bold">{l.name}</td>
                                <td>{l.phone} {l.email ? `(${l.email})` : ""}</td>
                                <td><span className="tag-plan">{l.plan?.toUpperCase()}</span></td>
                                <td>
                                  <select
                                    value={l.status || "new"}
                                    onChange={(e) => handleStatusChange(l._id, e.target.value)}
                                    className={`admin-select status-${l.status || "new"}`}
                                  >
                                    {STATUS_OPTIONS.map((s) => (
                                      <option key={s} value={s}>{s.toUpperCase()}</option>
                                    ))}
                                  </select>
                                </td>
                                <td>
                                  <button type="button" className="admin-delete" onClick={() => handleDeleteLead(l._id)}>
                                    Delete
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ===== TAB 2: ENQUIRIES / LEADS ===== */}
              {tab === "leads" && (
                <div className="admin-section">
                  <div className="admin-title-row">
                    <h1>Lead & Trial Requests ({filteredLeads.length})</h1>
                    <div className="admin-title-actions">
                      <div className="lead-filter-buttons">
                        {["all", "new", "contacted", "converted", "closed"].map((st) => (
                          <button
                            key={st}
                            type="button"
                            className={`btn-filter ${leadStatusFilter === st ? "active" : ""}`}
                            onClick={() => setLeadStatusFilter(st)}
                          >
                            {st.toUpperCase()}
                          </button>
                        ))}
                      </div>
                      <input
                        type="text"
                        className="admin-search-input"
                        placeholder="Search name, phone or plan..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="admin-table-wrap">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Phone</th>
                          <th>Email</th>
                          <th>Selected Plan</th>
                          <th>Status</th>
                          <th>Date</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredLeads.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="admin-empty">
                              No enquiries match your filter.
                            </td>
                          </tr>
                        ) : (
                          filteredLeads.map((lead) => (
                            <tr key={lead._id}>
                              <td className="font-bold">{lead.name}</td>
                              <td><a href={`tel:${lead.phone}`} className="admin-phone-link">{lead.phone}</a></td>
                              <td>{lead.email || "—"}</td>
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
                    <div>
                      <h1>Website Programs ({filteredPrograms.length})</h1>
                      <p className="admin-subtitle">Edit title, description, or add new training programs for the website.</p>
                    </div>
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
                            ✏️ Edit Program
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
                    <div>
                      <h1>Coaches Roster ({filteredTrainers.length})</h1>
                      <p className="admin-subtitle">Upload coach photo files (JPG/PNG) and edit trainer profile names & roles.</p>
                    </div>
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
                            ✏️ Edit Coach
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
                    <div>
                      <h1>Membership Tiers ({filteredPlans.length})</h1>
                      <p className="admin-subtitle">Modify prices, plan features, and featured status displayed on website pricing cards.</p>
                    </div>
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
                      <div key={p._id || p.key} className={`admin-card ${p.featured ? "featured-border" : ""}`}>
                        {p.featured && <span className="badge-featured">MOST POPULAR</span>}
                        <h3>
                          {p.name} — ₹{p.price}
                          <small>{p.period || "/Yr"}</small>
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
                            ✏️ Edit Plan
                          </button>
                          <button
                            type="button"
                            className="admin-delete-btn"
                            onClick={() => handleDeletePlan(p._id || p.key)}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ===== TAB 6: CUSTOMER REVIEWS (NEW) ===== */}
              {tab === "reviews" && (
                <div className="admin-section">
                  <div className="admin-title-row">
                    <div>
                      <h1>User Reviews & Testimonials ({filteredReviews.length})</h1>
                      <p className="admin-subtitle">Manage member feedback, approve user reviews, or add featured testimonials.</p>
                    </div>
                    <div className="admin-title-actions">
                      <input
                        type="text"
                        className="admin-search-input"
                        placeholder="Search review by reviewer or comment..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      <button type="button" className="btn-primary" onClick={() => openCreateModal("review")}>
                        + Add New Review
                      </button>
                    </div>
                  </div>

                  <div className="admin-table-wrap">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Member Name</th>
                          <th>Rating</th>
                          <th>Role/Tag</th>
                          <th>Review Comment</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredReviews.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="admin-empty">
                              No reviews match your search.
                            </td>
                          </tr>
                        ) : (
                          filteredReviews.map((rev) => (
                            <tr key={rev._id}>
                              <td className="font-bold">{rev.name}</td>
                              <td className="review-stars-cell">
                                {"★".repeat(rev.rating || 5)}
                              </td>
                              <td><span className="tag-role">{rev.role || "Member"}</span></td>
                              <td className="review-comment-cell">"{rev.comment}"</td>
                              <td>
                                <select
                                  value={rev.status || "approved"}
                                  onChange={(e) => handleReviewStatusChange(rev._id, e.target.value)}
                                  className={`admin-select status-${rev.status || "approved"}`}
                                >
                                  {REVIEW_STATUS_OPTIONS.map((st) => (
                                    <option key={st} value={st}>
                                      {st.toUpperCase()}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td>
                                <button
                                  type="button"
                                  className="admin-delete"
                                  onClick={() => handleDeleteReview(rev._id)}
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

              {/* ===== TAB 7: USERS / MEMBERS ===== */}
              {tab === "users" && (
                <div className="admin-section">
                  <div className="admin-title-row">
                    <h1>Registered Users & Members ({filteredUsers.length})</h1>
                    <input
                      type="text"
                      className="admin-search-input"
                      placeholder="Search member name or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
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
                        {filteredUsers.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="admin-empty">
                              No members match search.
                            </td>
                          </tr>
                        ) : (
                          filteredUsers.map((u) => (
                            <tr key={u._id}>
                              <td className="font-bold">{u.name}</td>
                              <td>{u.email}</td>
                              <td>
                                <span className={`badge-role role-${u.role}`}>{u.role?.toUpperCase()}</span>
                              </td>
                              <td>{new Date(u.createdAt || Date.now()).toLocaleDateString()}</td>
                              <td>
                                {u.role !== "admin" ? (
                                  <button
                                    type="button"
                                    className="admin-delete"
                                    onClick={() => handleDeleteUser(u._id)}
                                  >
                                    Delete Member
                                  </button>
                                ) : (
                                  <span className="admin-protected">Protected Admin</span>
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
                    rows={4}
                    value={programForm.description}
                    onChange={(e) => setProgramForm({ ...programForm, description: e.target.value })}
                    placeholder="Brief details about the training program..."
                  />
                </label>
                <label>
                  Display Order Index
                  <input
                    type="number"
                    min={1}
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
                <label className="file-upload-label">
                  Upload Coach Photo (JPG, JPEG, PNG only)
                  <div className="file-upload-box">
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                      onChange={handleTrainerImageUpload}
                      className="file-upload-input"
                    />
                    <div className="file-upload-ui">
                      <span className="file-upload-icon">📁</span>
                      <span className="file-upload-text">Click to choose image file from device</span>
                      <small className="file-upload-hint">Supported formats: JPG, JPEG, PNG</small>
                    </div>
                  </div>
                </label>
                {trainerForm.photo && (
                  <div className="trainer-photo-preview">
                    <div className="preview-head">
                      <span>Live Photo Preview:</span>
                      <button
                        type="button"
                        className="btn-remove-photo"
                        onClick={() => setTrainerForm({ ...trainerForm, photo: "" })}
                      >
                        ✕ Remove Photo
                      </button>
                    </div>
                    <img src={trainerForm.photo} alt="Preview" onError={(e) => (e.target.style.display = "none")} />
                  </div>
                )}
                <button type="submit" className="btn-primary">
                  {modalMode === "edit" ? "Update Coach Profile" : "Save Coach Profile"}
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
                    placeholder="e.g. 1 Year Plan"
                  />
                </label>
                <label>
                  Price (₹ INR)
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
                    placeholder="/Yr or /mo"
                  />
                </label>
                <label>
                  Features List (comma separated)
                  <textarea
                    rows={3}
                    value={planForm.featuresStr}
                    onChange={(e) => setPlanForm({ ...planForm, featuresStr: e.target.value })}
                    placeholder="Full Access, Personal Locker, Sauna Access"
                  />
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={planForm.featured}
                    onChange={(e) => setPlanForm({ ...planForm, featured: e.target.checked })}
                  />
                  Mark as Featured (★ BEST VALUE)
                </label>
                <button type="submit" className="btn-primary">
                  {modalMode === "edit" ? "Update Membership Plan" : "Save Membership Plan"}
                </button>
              </form>
            )}

            {/* REVIEW FORM (ADMIN) */}
            {modalType === "review" && (
              <form onSubmit={handleSaveReview} className="admin-modal-form">
                <label>
                  Member Name
                  <input
                    type="text"
                    required
                    value={reviewForm.name}
                    onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                    placeholder="e.g. Kavya Desai"
                  />
                </label>
                <label>
                  Rating (1 to 5 Stars)
                  <select
                    value={reviewForm.rating}
                    onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
                    className="admin-select"
                  >
                    {[5, 4, 3, 2, 1].map((num) => (
                      <option key={num} value={num}>
                        {"★".repeat(num)} ({num} Star{num > 1 ? "s" : ""})
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Role / Member Tag
                  <input
                    type="text"
                    value={reviewForm.role}
                    onChange={(e) => setReviewForm({ ...reviewForm, role: e.target.value })}
                    placeholder="e.g. Member since 2024"
                  />
                </label>
                <label>
                  Review Comment / Feedback
                  <textarea
                    required
                    rows={4}
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    placeholder="Write member feedback quote..."
                  />
                </label>
                <button type="submit" className="btn-primary">
                  Save & Publish Review
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
