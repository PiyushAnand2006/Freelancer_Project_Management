import { FormEvent, ReactNode, createContext, useContext, useEffect, useMemo, useState } from "react";
import { Link, Navigate, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeIndianRupee,
  BriefcaseBusiness,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  FileText,
  Gauge,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Plus,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserRound
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis
} from "recharts";
import {
  api,
  formatDate,
  formatMoney,
  type Contract,
  type Invoice,
  type Milestone,
  type Project,
  type Proposal,
  type Role,
  type User
} from "./api";

type AuthContextValue = {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: { name: string; email: string; password: string; role: Role }) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("Auth context missing");
  return context;
}

function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState(() => localStorage.getItem("flf_token"));
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("flf_user");
    return stored ? (JSON.parse(stored) as User) : null;
  });

  const persist = (nextToken: string, nextUser: User) => {
    localStorage.setItem("flf_token", nextToken);
    localStorage.setItem("flf_user", JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      login: async (email, password) => {
        const { data } = await api.post<{ token: string; user: User }>("/auth/login", { email, password });
        persist(data.token, data.user);
      },
      register: async (payload) => {
        const { data } = await api.post<{ token: string; user: User }>("/auth/register", payload);
        persist(data.token, data.user);
      },
      logout: () => {
        localStorage.removeItem("flf_token");
        localStorage.removeItem("flf_user");
        setToken(null);
        setUser(null);
      }
    }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function Protected({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const location = useLocation();
  if (!token) return <Navigate to="/login" replace state={{ from: location }} />;
  return children;
}

function Badge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    open: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    in_progress: "bg-blue-50 text-blue-700 ring-blue-200",
    completed: "bg-slate-100 text-slate-700 ring-slate-200",
    active: "bg-blue-50 text-blue-700 ring-blue-200",
    pending: "bg-amber-50 text-amber-700 ring-amber-200",
    submitted: "bg-indigo-50 text-indigo-700 ring-indigo-200",
    approved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    accepted: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    rejected: "bg-rose-50 text-rose-700 ring-rose-200",
    unpaid: "bg-amber-50 text-amber-700 ring-amber-200",
    paid: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    overdue: "bg-rose-50 text-rose-700 ring-rose-200"
  };

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold capitalize ring-1 ${styles[status] ?? styles.pending}`}>
      {status.replace("_", " ")}
    </span>
  );
}

function Shell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const links = [
    { to: "/app", label: "Dashboard", icon: LayoutDashboard },
    { to: "/app/projects", label: user?.role === "client" ? "My Projects" : "Marketplace", icon: BriefcaseBusiness },
    { to: "/app/proposals", label: "Proposals", icon: Send },
    { to: "/app/contracts", label: "Contracts", icon: ListChecks },
    { to: "/app/invoices", label: "Invoices", icon: FileText }
  ];

  return (
    <div className="min-h-screen bg-[#f6f8fb]">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 border-r border-slate-200 bg-white px-5 py-6 lg:block">
        <Link to="/app" className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-lg bg-ink text-white">
            <Sparkles size={22} />
          </div>
          <div>
            <p className="text-base font-black text-slate-950">FreeLanceFlow</p>
            <p className="text-xs font-medium text-slate-500">Project operating system</p>
          </div>
        </Link>

        <nav className="mt-8 space-y-1">
          {links.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold transition ${
                  active ? "bg-ink text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-6 left-5 right-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-white text-ocean ring-1 ring-slate-200">
              <UserRound size={18} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-900">{user?.name}</p>
              <p className="text-xs font-medium capitalize text-slate-500">{user?.role}</p>
            </div>
          </div>
          <button onClick={logout} className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-bold text-slate-600 ring-1 ring-slate-200 hover:text-slate-950">
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>

      <main className="lg:pl-72">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 px-5 py-4 backdrop-blur lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-ocean">Workspace</p>
              <h1 className="text-xl font-black text-slate-950 sm:text-2xl">Freelance lifecycle dashboard</h1>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-600">
              <ShieldCheck size={16} className="text-ocean" />
              MySQL-backed local demo
            </div>
          </div>
          <nav className="mt-4 flex gap-2 overflow-x-auto lg:hidden">
            {links.map((item) => (
              <Link key={item.to} to={item.to} className="whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700">
                {item.label}
              </Link>
            ))}
          </nav>
        </header>
        <div className="px-5 py-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}

function Landing() {
  const { token } = useAuth();
  if (token) return <Navigate to="/app" replace />;

  return (
    <div className="min-h-screen overflow-hidden bg-ink text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(45,212,191,0.20),transparent_28%),radial-gradient(circle_at_80%_0%,rgba(245,158,11,0.14),transparent_26%)]" />
      <main className="relative mx-auto grid min-h-screen max-w-7xl items-center gap-12 px-6 py-10 lg:grid-cols-[0.9fr_1.1fr]">
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm font-semibold text-teal-100">
            <Sparkles size={16} />
            Freelance workflow, from bid to payment
          </div>
          <h1 className="max-w-2xl text-5xl font-black leading-tight tracking-normal sm:text-6xl">
            FreeLanceFlow
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-slate-300">
            A polished role-based system where clients post projects, freelancers bid, contracts track milestones, and invoices settle through simulated payments.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/login" className="btn-primary bg-white text-ink hover:bg-slate-100">
              Open demo
              <ArrowRight size={18} />
            </Link>
            <Link to="/register" className="btn-secondary border-white/20 bg-white/10 text-white hover:bg-white/15">
              Create account
            </Link>
          </div>
        </motion.section>

        <motion.section initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }} className="rounded-lg border border-white/10 bg-white/10 p-4 shadow-2xl backdrop-blur">
          <div className="rounded-lg bg-[#f8fafc] p-4 text-slate-950">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-ocean">Client command center</p>
                <h2 className="text-xl font-black">Active project pipeline</h2>
              </div>
              <Badge status="in_progress" />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ["Open Projects", "12", BriefcaseBusiness],
                ["Bids Received", "38", Send],
                ["Pending Invoices", "₹74k", CreditCard]
              ].map(([label, value, Icon]) => (
                <div key={label as string} className="rounded-lg border border-slate-200 bg-white p-4">
                  <Icon className="mb-4 text-ocean" size={22} />
                  <p className="text-2xl font-black">{value as string}</p>
                  <p className="text-sm font-semibold text-slate-500">{label as string}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="font-bold">Milestone delivery</p>
                <p className="text-sm font-semibold text-ocean">78% approved</p>
              </div>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[{ n: "M1", v: 20 }, { n: "M2", v: 45 }, { n: "M3", v: 58 }, { n: "M4", v: 78 }]}>
                    <defs>
                      <linearGradient id="flow" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="5%" stopColor="#0f766e" stopOpacity={0.32} />
                        <stop offset="95%" stopColor="#0f766e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="n" stroke="#64748b" />
                    <Tooltip />
                    <Area type="monotone" dataKey="v" stroke="#0f766e" fill="url(#flow)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </motion.section>
      </main>
    </div>
  );
}

function AuthPage({ mode }: { mode: "login" | "register" }) {
  const auth = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<Role>("client");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(event.currentTarget);

    try {
      if (mode === "login") {
        await auth.login(String(form.get("email")), String(form.get("password")));
      } else {
        await auth.register({
          name: String(form.get("name")),
          email: String(form.get("email")),
          password: String(form.get("password")),
          role
        });
      }
      navigate("/app");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not complete request");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-slate-100 px-4 py-10">
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
        <Link to="/" className="mb-6 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-lg bg-ink text-white">
            <Sparkles size={20} />
          </div>
          <div>
            <p className="text-lg font-black text-slate-950">FreeLanceFlow</p>
            <p className="text-sm font-medium text-slate-500">Local demo workspace</p>
          </div>
        </Link>
        <h1 className="text-2xl font-black text-slate-950">{mode === "login" ? "Welcome back" : "Create your workspace"}</h1>
        <p className="mt-2 text-sm font-medium text-slate-500">
          {mode === "login" ? "Use the demo accounts from the README or your own registered account." : "Choose the role you want to test first."}
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          {mode === "register" && <input className="input" name="name" placeholder="Full name" required />}
          <input className="input" name="email" type="email" placeholder="Email" defaultValue={mode === "login" ? "arjun@email.com" : ""} required />
          <input className="input" name="password" type="password" placeholder="Password" defaultValue={mode === "login" ? "password123" : ""} required />
          {mode === "register" && (
            <div className="grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1">
              {(["client", "freelancer"] as Role[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setRole(item)}
                  className={`rounded-md px-3 py-2 text-sm font-bold capitalize transition ${role === item ? "bg-white text-ink shadow-sm" : "text-slate-500"}`}
                >
                  {item}
                </button>
              ))}
            </div>
          )}
          {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-bold text-rose-700">{error}</p>}
          <button className="btn-primary w-full" disabled={loading}>
            {loading ? "Working..." : mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm font-medium text-slate-500">
          {mode === "login" ? "Need an account?" : "Already registered?"}{" "}
          <Link className="font-bold text-ocean" to={mode === "login" ? "/register" : "/login"}>
            {mode === "login" ? "Register" : "Login"}
          </Link>
        </p>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon }: { label: string; value: string; icon: LucideIcon }) {
  return (
    <div className="panel p-5">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-teal-50 text-ocean">
        <Icon size={22} />
      </div>
      <p className="text-3xl font-black text-slate-950">{value}</p>
      <p className="mt-1 text-sm font-semibold text-slate-500">{label}</p>
    </div>
  );
}

function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<{ stats: Record<string, number>; activity: Proposal[] } | null>(null);

  useEffect(() => {
    api.get("/dashboard").then((res) => setData(res.data));
  }, []);

  const stats = data?.stats ?? {};
  const chart = [
    { name: "Projects", value: Number(stats.projects ?? stats.proposals ?? 0) },
    { name: "Active", value: Number(stats.activeProjects ?? stats.activeContracts ?? 0) },
    { name: "Billing", value: Number(stats.billed ?? stats.earnings ?? 0) / 1000 },
    { name: "Invoices", value: Number(stats.unpaidInvoices ?? stats.openProjects ?? 0) }
  ];

  return (
    <Shell>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label={user?.role === "client" ? "Total projects" : "Submitted proposals"} value={String(stats.projects ?? stats.proposals ?? 0)} icon={BriefcaseBusiness} />
        <StatCard label="Active work" value={String(stats.activeProjects ?? stats.activeContracts ?? 0)} icon={Gauge} />
        <StatCard label={user?.role === "client" ? "Total billed" : "Earnings"} value={formatMoney(stats.billed ?? stats.earnings ?? 0)} icon={BadgeIndianRupee} />
        <StatCard label={user?.role === "client" ? "Open projects" : "Unpaid invoices"} value={String(stats.openProjects ?? stats.unpaidInvoices ?? 0)} icon={FileText} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <section className="panel p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="section-title">Operational overview</h2>
            <Badge status={user?.role ?? "active"} />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#0f766e" fill="#ccfbf1" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="panel p-5">
          <h2 className="section-title">Recent activity</h2>
          <div className="mt-4 space-y-3">
            {(data?.activity ?? []).map((item) => (
              <div key={item.proposal_id} className="rounded-lg border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-slate-950">{item.project_title}</p>
                    <p className="mt-1 text-sm font-medium text-slate-500">
                      {formatMoney(item.bid_amount)} · {item.estimated_days} days
                    </p>
                  </div>
                  <Badge status={item.status} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </Shell>
  );
}

function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState("");
  const [refresh, setRefresh] = useState(0);
  const isClient = user?.role === "client";

  useEffect(() => {
    const params = new URLSearchParams();
    if (isClient) params.set("mine", "true");
    if (!isClient) params.set("status", "open");
    if (search) params.set("search", search);
    api.get(`/projects?${params.toString()}`).then((res) => setProjects(res.data.projects));
  }, [isClient, refresh, search]);

  async function createProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await api.post("/projects", Object.fromEntries(form));
    event.currentTarget.reset();
    setRefresh((value) => value + 1);
  }

  return (
    <Shell>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black text-slate-950">{isClient ? "My projects" : "Project marketplace"}</h2>
          <p className="mt-1 text-sm font-medium text-slate-500">Browse cleanly structured project work from the MySQL core.</p>
        </div>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-3 text-slate-400" size={18} />
          <input className="input pl-10" placeholder="Search projects" value={search} onChange={(event) => setSearch(event.target.value)} />
        </div>
      </div>

      {isClient && (
        <form onSubmit={createProject} className="panel mb-6 grid gap-3 p-5 lg:grid-cols-6">
          <input className="input lg:col-span-2" name="title" placeholder="Project title" required />
          <input className="input" name="budget_min" type="number" placeholder="Min budget" required />
          <input className="input" name="budget_max" type="number" placeholder="Max budget" required />
          <input className="input" name="deadline" type="date" />
          <select className="input" name="project_type" defaultValue="fixed">
            <option value="fixed">Fixed</option>
            <option value="hourly">Hourly</option>
          </select>
          <textarea className="input lg:col-span-5" name="description" placeholder="Project description" rows={2} />
          <button className="btn-primary">
            <Plus size={18} />
            Post project
          </button>
        </form>
      )}

      <div className="grid gap-5 xl:grid-cols-3">
        {projects.map((project) => (
          <ProjectCard key={project.project_id} project={project} canBid={!isClient} onRefresh={() => setRefresh((value) => value + 1)} />
        ))}
      </div>
    </Shell>
  );
}

function ProjectCard({ project, canBid, onRefresh }: { project: Project; canBid: boolean; onRefresh: () => void }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isConfirmingDeadlineDelete, setIsConfirmingDeadlineDelete] = useState(false);

  const canDelete = user && (user.role === "admin" || (user.role === "client" && project.client_id === user.userId));

  async function handleDelete() {
    try {
      await api.delete(`/projects/${project.project_id}`);
      onRefresh();
    } catch (err) {
      console.error("Failed to delete project:", err);
      alert("Failed to delete project. Please try again.");
    }
  }

  async function handleDeleteDeadline() {
    try {
      await api.delete(`/projects/${project.project_id}/deadline`);
      setIsConfirmingDeadlineDelete(false);
      onRefresh();
    } catch (err) {
      console.error("Failed to delete project deadline:", err);
      alert("Failed to delete project deadline. Please try again.");
    }
  }

  async function submitProposal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await api.post("/proposals", { project_id: project.project_id, ...Object.fromEntries(form) });
    setOpen(false);
    onRefresh();
  }

  return (
    <article className="panel p-5 transition hover:-translate-y-0.5 hover:shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-black text-slate-950">{project.title}</h3>
          <p className="mt-1 text-sm font-semibold text-slate-500">by {project.client_name}</p>
        </div>
        <Badge status={project.status} />
      </div>
      <p className="mt-4 line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-slate-600">{project.description || "No description provided."}</p>
      <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="font-bold text-slate-950">{formatMoney(project.budget_min)} - {formatMoney(project.budget_max)}</p>
          <p className="text-slate-500">Budget</p>
        </div>
        <div className="relative rounded-lg bg-slate-50 p-3">
          <div className="flex items-center justify-between gap-1">
            <p className="font-bold text-slate-950">{formatDate(project.deadline)}</p>
            {project.deadline && canDelete && (
              isConfirmingDeadlineDelete ? (
                <div className="flex items-center gap-1">
                  <button onClick={handleDeleteDeadline} className="text-[10px] font-bold text-rose-600 hover:underline" title="Confirm delete deadline">
                    Yes
                  </button>
                  <span className="text-[10px] text-slate-400">/</span>
                  <button onClick={() => setIsConfirmingDeadlineDelete(false)} className="text-[10px] font-bold text-slate-500 hover:underline" title="Cancel">
                    No
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsConfirmingDeadlineDelete(true)}
                  className="rounded p-0.5 text-slate-400 hover:bg-slate-200 hover:text-rose-600 transition"
                  title="Remove deadline"
                >
                  <Trash2 size={12} />
                </button>
              )
            )}
          </div>
          <p className="text-slate-500">Deadline</p>
        </div>
      </div>
      <div className="mt-5 flex items-center justify-between">
        <span className="text-sm font-bold capitalize text-slate-500">{project.project_type} · {project.proposal_count} bids</span>
        {canBid && (
          <button onClick={() => setOpen((value) => !value)} className="btn-secondary">
            Bid
            <ChevronRight size={16} />
          </button>
        )}
        {canDelete && (
          isConfirmingDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-rose-600">Delete?</span>
              <button onClick={handleDelete} className="rounded bg-rose-600 px-2 py-1 text-xs font-bold text-white hover:bg-rose-700 transition">
                Confirm
              </button>
              <button onClick={() => setIsConfirmingDelete(false)} className="rounded bg-slate-200 px-2 py-1 text-xs font-bold text-slate-700 hover:bg-slate-300 transition">
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsConfirmingDelete(true)}
              className="flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-100 hover:text-rose-700 transition"
              title="Delete Project"
            >
              <Trash2 size={14} />
              Delete
            </button>
          )
        )}
      </div>
      {open && (
        <form onSubmit={submitProposal} className="mt-4 space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <input className="input" name="bid_amount" type="number" placeholder="Bid amount" required />
          <input className="input" name="estimated_days" type="number" placeholder="Estimated days" required />
          <textarea className="input" name="cover_letter" placeholder="Cover letter" rows={3} />
          <button className="btn-primary w-full">Submit proposal</button>
        </form>
      )}
    </article>
  );
}

function Proposals() {
  const { user } = useAuth();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    api.get("/proposals").then((res) => setProposals(res.data.proposals));
  }, [refresh]);

  async function accept(id: number) {
    await api.post(`/proposals/${id}/accept`);
    setRefresh((value) => value + 1);
  }

  return (
    <Shell>
      <div className="panel overflow-hidden">
        <div className="border-b border-slate-200 p-5">
          <h2 className="section-title">{user?.role === "client" ? "Received proposals" : "My bids"}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3">Project</th>
                <th className="px-5 py-3">{user?.role === "client" ? "Freelancer" : "Client"}</th>
                <th className="px-5 py-3">Bid</th>
                <th className="px-5 py-3">Days</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {proposals.map((proposal) => (
                <tr key={proposal.proposal_id}>
                  <td className="px-5 py-4 font-bold text-slate-950">{proposal.project_title}</td>
                  <td className="px-5 py-4 text-slate-600">{proposal.freelancer_name ?? proposal.client_name}</td>
                  <td className="px-5 py-4 text-slate-600">{formatMoney(proposal.bid_amount)}</td>
                  <td className="px-5 py-4 text-slate-600">{proposal.estimated_days}</td>
                  <td className="px-5 py-4"><Badge status={proposal.status} /></td>
                  <td className="px-5 py-4">
                    {user?.role === "client" && proposal.status === "pending" ? (
                      <button onClick={() => accept(proposal.proposal_id)} className="btn-primary py-2">
                        Accept
                      </button>
                    ) : (
                      <span className="text-sm font-semibold text-slate-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Shell>
  );
}

function Contracts() {
  const [contracts, setContracts] = useState<Contract[]>([]);

  useEffect(() => {
    api.get("/contracts").then((res) => setContracts(res.data.contracts));
  }, []);

  return (
    <Shell>
      <div className="grid gap-5 xl:grid-cols-3">
        {contracts.map((contract) => {
          const progress = contract.milestone_count ? Math.round((Number(contract.approved_milestones ?? 0) / Number(contract.milestone_count)) * 100) : 0;
          return (
            <Link key={contract.contract_id} to={`/app/contracts/${contract.contract_id}`} className="panel p-5 transition hover:-translate-y-0.5 hover:shadow-soft">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-lg font-black text-slate-950">{contract.project_title}</h3>
                <Badge status={contract.status} />
              </div>
              <p className="mt-2 text-sm font-semibold text-slate-500">{contract.client_name} with {contract.freelancer_name}</p>
              <p className="mt-5 text-3xl font-black text-slate-950">{formatMoney(contract.agreed_amount)}</p>
              <div className="mt-5">
                <div className="mb-2 flex justify-between text-sm font-bold text-slate-500">
                  <span>Milestones</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div className="h-2 rounded-full bg-ocean" style={{ width: `${progress}%` }} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </Shell>
  );
}

function ContractDetail() {
  const { user } = useAuth();
  const { id } = useParams();
  const [contract, setContract] = useState<Contract | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    api.get(`/contracts/${id}`).then((res) => {
      setContract(res.data.contract);
      setMilestones(res.data.milestones);
      setInvoices(res.data.invoices);
    });
  }, [id, refresh]);

  async function updateMilestone(milestoneId: number, status: string) {
    await api.patch(`/milestones/${milestoneId}/status`, { status });
    setRefresh((value) => value + 1);
  }

  async function createMilestone(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await api.post(`/contracts/${id}/milestones`, Object.fromEntries(form));
    event.currentTarget.reset();
    setRefresh((value) => value + 1);
  }

  async function generateInvoice() {
    await api.post("/invoices/generate", { contract_id: Number(id) });
    setRefresh((value) => value + 1);
  }

  if (!contract) {
    return <Shell><p className="font-bold text-slate-500">Loading contract...</p></Shell>;
  }

  return (
    <Shell>
      <div className="mb-6 rounded-lg bg-ink p-6 text-white shadow-soft">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-teal-200">Contract room</p>
            <h2 className="mt-2 text-3xl font-black">{contract.project_title}</h2>
            <p className="mt-2 text-slate-300">{contract.client_name} with {contract.freelancer_name}</p>
          </div>
          <div className="text-right">
            <Badge status={contract.status} />
            <p className="mt-3 text-2xl font-black">{formatMoney(contract.agreed_amount)}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <section className="panel overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-200 p-5">
            <h3 className="section-title">Milestones</h3>
            <button onClick={generateInvoice} className="btn-secondary">
              <FileText size={16} />
              Generate invoice
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {milestones.map((milestone) => (
              <div key={milestone.milestone_id} className="grid gap-4 p-5 md:grid-cols-[1fr_auto]">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h4 className="font-black text-slate-950">{milestone.title}</h4>
                    <Badge status={milestone.status} />
                  </div>
                  <p className="mt-2 text-sm font-semibold text-slate-500">
                    {formatMoney(milestone.amount)} · due {formatDate(milestone.due_date)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {user?.role === "freelancer" && milestone.status === "pending" && (
                    <button onClick={() => updateMilestone(milestone.milestone_id, "submitted")} className="btn-primary py-2">
                      Submit
                    </button>
                  )}
                  {user?.role === "client" && milestone.status === "submitted" && (
                    <button onClick={() => updateMilestone(milestone.milestone_id, "approved")} className="btn-primary py-2">
                      Approve
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <aside className="space-y-6">
          {user?.role === "client" && (
            <form onSubmit={createMilestone} className="panel space-y-3 p-5">
              <h3 className="section-title">Add milestone</h3>
              <input className="input" name="title" placeholder="Milestone title" required />
              <input className="input" name="amount" type="number" placeholder="Amount" required />
              <input className="input" name="due_date" type="date" required />
              <button className="btn-primary w-full">
                <Plus size={16} />
                Add milestone
              </button>
            </form>
          )}

          <div className="panel p-5">
            <h3 className="section-title">Invoices</h3>
            <div className="mt-4 space-y-3">
              {invoices.map((invoice) => (
                <div key={invoice.invoice_id} className="rounded-lg border border-slate-200 p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-black text-slate-950">#{invoice.invoice_id}</p>
                    <Badge status={invoice.status} />
                  </div>
                  <p className="mt-2 text-xl font-black">{formatMoney(invoice.total_amount)}</p>
                  <p className="text-sm font-semibold text-slate-500">Due {formatDate(invoice.due_date)}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </Shell>
  );
}

function Invoices() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    api.get("/invoices").then((res) => setInvoices(res.data.invoices));
  }, [refresh]);

  async function pay(invoiceId: number) {
    await api.post("/payments", { invoice_id: invoiceId, payment_method: "UPI" });
    setRefresh((value) => value + 1);
  }

  return (
    <Shell>
      <div className="panel overflow-hidden">
        <div className="border-b border-slate-200 p-5">
          <h2 className="section-title">Invoices and payments</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3">Invoice</th>
                <th className="px-5 py-3">Project</th>
                <th className="px-5 py-3">Party</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Due</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.map((invoice) => (
                <tr key={invoice.invoice_id}>
                  <td className="px-5 py-4 font-black text-slate-950">#{invoice.invoice_id}</td>
                  <td className="px-5 py-4 font-bold text-slate-800">{invoice.project_title}</td>
                  <td className="px-5 py-4 text-slate-600">{user?.role === "client" ? invoice.freelancer_name : invoice.client_name}</td>
                  <td className="px-5 py-4 text-slate-600">{formatMoney(invoice.total_amount)}</td>
                  <td className="px-5 py-4 text-slate-600">{formatDate(invoice.due_date)}</td>
                  <td className="px-5 py-4"><Badge status={invoice.status} /></td>
                  <td className="px-5 py-4">
                    {user?.role === "client" && invoice.status === "unpaid" ? (
                      <button onClick={() => pay(invoice.invoice_id)} className="btn-primary py-2">
                        Pay now
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-slate-500">{invoice.transaction_id ?? "-"}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Shell>
  );
}

function NotFound() {
  return (
    <Shell>
      <div className="panel p-10 text-center">
        <h2 className="text-2xl font-black text-slate-950">Page not found</h2>
        <Link className="btn-primary mt-5" to="/app">Back to dashboard</Link>
      </div>
    </Shell>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/register" element={<AuthPage mode="register" />} />
        <Route path="/app" element={<Protected><Dashboard /></Protected>} />
        <Route path="/app/projects" element={<Protected><Projects /></Protected>} />
        <Route path="/app/proposals" element={<Protected><Proposals /></Protected>} />
        <Route path="/app/contracts" element={<Protected><Contracts /></Protected>} />
        <Route path="/app/contracts/:id" element={<Protected><ContractDetail /></Protected>} />
        <Route path="/app/invoices" element={<Protected><Invoices /></Protected>} />
        <Route path="*" element={<Protected><NotFound /></Protected>} />
      </Routes>
    </AuthProvider>
  );
}
