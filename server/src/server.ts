import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { pool, query } from "./db.js";
import { asyncHandler, requireAuth, requireRole, signToken } from "./middleware.js";
import type { AuthUser } from "./types.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT ?? 4000);

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
    credentials: true
  })
);
app.use(express.json({ limit: "1mb" }));

type UserRow = RowDataPacket & {
  user_id: number;
  name: string;
  email: string;
  password: string;
  role: "client" | "freelancer" | "admin";
  is_verified: number;
  created_at: string;
};

function toPublicUser(user: UserRow) {
  return {
    userId: user.user_id,
    name: user.name,
    email: user.email,
    role: user.role,
    isVerified: Boolean(user.is_verified),
    createdAt: user.created_at
  };
}

function toAuthUser(user: UserRow): AuthUser {
  return {
    userId: user.user_id,
    role: user.role,
    email: user.email,
    name: user.name
  };
}

function requireFields(body: Record<string, unknown>, fields: string[]) {
  const missing = fields.filter((field) => body[field] === undefined || body[field] === "");
  if (missing.length) {
    const message = `Missing required field${missing.length > 1 ? "s" : ""}: ${missing.join(", ")}`;
    const error = new Error(message);
    (error as Error & { status?: number }).status = 400;
    throw error;
  }
}app.get("/", (_req, res) => {
  res.send("<h1>FreeLanceFlow API Server</h1><p>The backend services are running successfully on this port. Please use the frontend application at <a href='http://localhost:5173'>http://localhost:5173</a> to interact with the application.</p>");
});

app.get("/api/health", asyncHandler(async (_req, res) => {
  await query<RowDataPacket[]>("SELECT 1 AS ok");
  res.json({ ok: true, service: "FreeLanceFlow API" });
}));
app.post("/api/auth/register", asyncHandler(async (req, res) => {
  const body = req.body as Record<string, string>;
  requireFields(body, ["name", "email", "password", "role"]);

  if (!["client", "freelancer"].includes(body.role)) {
    return res.status(400).json({ message: "Role must be client or freelancer" });
  }

  const password = await bcrypt.hash(body.password, 12);
  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO users (name, email, password, role, is_verified)
     VALUES (:name, :email, :password, :role, TRUE)`,
    { name: body.name, email: body.email, password, role: body.role }
  );

  const [rows] = await pool.execute<UserRow[]>("SELECT * FROM users WHERE user_id = ?", [result.insertId]);
  const user = rows[0];
  const authUser = toAuthUser(user);

  res.status(201).json({ token: signToken(authUser), user: toPublicUser(user) });
}));

app.post("/api/auth/login", asyncHandler(async (req, res) => {
  const body = req.body as Record<string, string>;
  requireFields(body, ["email", "password"]);

  const [rows] = await pool.execute<UserRow[]>("SELECT * FROM users WHERE email = ?", [body.email]);
  const user = rows[0];

  if (!user || !(await bcrypt.compare(body.password, user.password))) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const authUser = toAuthUser(user);
  res.json({ token: signToken(authUser), user: toPublicUser(user) });
}));

app.get("/api/auth/me", requireAuth, asyncHandler(async (req, res) => {
  const [rows] = await pool.execute<UserRow[]>("SELECT * FROM users WHERE user_id = ?", [req.user!.userId]);
  res.json({ user: toPublicUser(rows[0]) });
}));

app.get("/api/users", requireAuth, requireRole("admin"), asyncHandler(async (_req, res) => {
  const users = await query<RowDataPacket[]>(
    "SELECT user_id, name, email, role, is_verified, created_at FROM users ORDER BY created_at DESC"
  );
  res.json({ users });
}));

app.get("/api/dashboard", requireAuth, asyncHandler(async (req, res) => {
  const user = req.user!;

  if (user.role === "client") {
    const [stats] = await pool.execute<RowDataPacket[]>(
      `SELECT
        COUNT(*) AS projects,
        SUM(status = 'open') AS openProjects,
        SUM(status = 'in_progress') AS activeProjects,
        COALESCE((SELECT SUM(total_amount) FROM invoices WHERE client_id = ?), 0) AS billed
       FROM projects WHERE client_id = ?`,
      [user.userId, user.userId]
    );
    const proposals = await query<RowDataPacket[]>(
      `SELECT p.proposal_id, p.bid_amount, p.estimated_days, p.status, u.name AS freelancer, pr.title AS project_title
       FROM proposals p
       JOIN users u ON u.user_id = p.freelancer_id
       JOIN projects pr ON pr.project_id = p.project_id
       WHERE pr.client_id = :clientId
       ORDER BY p.submitted_at DESC
       LIMIT 6`,
      { clientId: user.userId }
    );
    return res.json({ stats: stats[0], activity: proposals });
  }

  const [stats] = await pool.execute<RowDataPacket[]>(
    `SELECT
      (SELECT COUNT(*) FROM proposals WHERE freelancer_id = ?) AS proposals,
      (SELECT COUNT(*) FROM contracts WHERE freelancer_id = ? AND status = 'active') AS activeContracts,
      (SELECT COALESCE(SUM(amount_paid), 0) FROM payments WHERE payee_id = ? AND payment_status = 'success') AS earnings,
      (SELECT COUNT(*) FROM invoices WHERE freelancer_id = ? AND status = 'unpaid') AS unpaidInvoices`,
    [user.userId, user.userId, user.userId, user.userId]
  );
  const activity = await query<RowDataPacket[]>(
    `SELECT p.proposal_id, p.bid_amount, p.estimated_days, p.status, pr.title AS project_title
     FROM proposals p
     JOIN projects pr ON pr.project_id = p.project_id
     WHERE p.freelancer_id = :freelancerId
     ORDER BY p.submitted_at DESC
     LIMIT 6`,
    { freelancerId: user.userId }
  );
  return res.json({ stats: stats[0], activity });
}));

app.get("/api/projects", requireAuth, asyncHandler(async (req, res) => {
  const user = req.user!;
  const status = typeof req.query.status === "string" ? req.query.status : undefined;
  const mine = req.query.mine === "true";
  const search = typeof req.query.search === "string" ? `%${req.query.search}%` : "%";

  const clauses = ["(p.title LIKE :search OR COALESCE(p.description, '') LIKE :search)"];
  const params: Record<string, unknown> = { search };

  if (status) {
    clauses.push("p.status = :status");
    params.status = status;
  }

  if (mine && user.role === "client") {
    clauses.push("p.client_id = :userId");
    params.userId = user.userId;
  }

  const projects = await query<RowDataPacket[]>(
    `SELECT p.*, u.name AS client_name, COUNT(prop.proposal_id) AS proposal_count
     FROM projects p
     JOIN users u ON u.user_id = p.client_id
     LEFT JOIN proposals prop ON prop.project_id = p.project_id
     WHERE ${clauses.join(" AND ")}
     GROUP BY p.project_id
     ORDER BY p.created_at DESC`,
    params
  );

  res.json({ projects });
}));

app.post("/api/projects", requireAuth, requireRole("client"), asyncHandler(async (req, res) => {
  const body = req.body as Record<string, string | number>;
  requireFields(body, ["title", "budget_min", "budget_max", "project_type"]);

  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO projects (client_id, title, description, budget_min, budget_max, deadline, project_type, status)
     VALUES (:clientId, :title, :description, :budgetMin, :budgetMax, :deadline, :projectType, 'open')`,
    {
      clientId: req.user!.userId,
      title: body.title,
      description: body.description ?? "",
      budgetMin: body.budget_min,
      budgetMax: body.budget_max,
      deadline: body.deadline || null,
      projectType: body.project_type
    }
  );

  res.status(201).json({ projectId: result.insertId });
}));

app.get("/api/projects/:id", requireAuth, asyncHandler(async (req, res) => {
  const [projectRows] = await pool.execute<RowDataPacket[]>(
    `SELECT p.*, u.name AS client_name
     FROM projects p
     JOIN users u ON u.user_id = p.client_id
     WHERE p.project_id = ?`,
    [req.params.id]
  );

  if (!projectRows[0]) return res.status(404).json({ message: "Project not found" });

  const proposals = await query<RowDataPacket[]>(
    `SELECT p.*, u.name AS freelancer_name
     FROM proposals p
     JOIN users u ON u.user_id = p.freelancer_id
     WHERE p.project_id = :projectId
     ORDER BY p.bid_amount ASC`,
    { projectId: Number(req.params.id) }
  );

  res.json({ project: projectRows[0], proposals });
}));

app.delete("/api/projects/:id", requireAuth, asyncHandler(async (req, res) => {
  const projectId = Number(req.params.id);
  const user = req.user!;

  const [projectRows] = await pool.execute<RowDataPacket[]>(
    "SELECT * FROM projects WHERE project_id = ?",
    [projectId]
  );
  const project = projectRows[0];
  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  if (user.role !== "admin" && (user.role !== "client" || project.client_id !== user.userId)) {
    return res.status(403).json({ message: "You are not authorized to delete this project" });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    await connection.execute(
      `DELETE FROM payments 
       WHERE invoice_id IN (
         SELECT invoice_id FROM invoices 
         WHERE contract_id IN (
           SELECT contract_id FROM contracts 
           WHERE proposal_id IN (
             SELECT proposal_id FROM proposals WHERE project_id = ?
           )
         )
       )`,
      [projectId]
    );

    await connection.execute(
      `DELETE FROM invoices 
       WHERE contract_id IN (
         SELECT contract_id FROM contracts 
         WHERE proposal_id IN (
           SELECT proposal_id FROM proposals WHERE project_id = ?
         )
       )`,
      [projectId]
    );

    await connection.execute(
      `DELETE FROM milestones 
       WHERE contract_id IN (
         SELECT contract_id FROM contracts 
         WHERE proposal_id IN (
           SELECT proposal_id FROM proposals WHERE project_id = ?
         )
       )`,
      [projectId]
    );

    await connection.execute(
      `DELETE FROM contracts 
       WHERE proposal_id IN (
         SELECT proposal_id FROM proposals WHERE project_id = ?
       )`,
      [projectId]
    );

    await connection.execute(
      "DELETE FROM proposals WHERE project_id = ?",
      [projectId]
    );

    await connection.execute(
      "DELETE FROM projects WHERE project_id = ?",
      [projectId]
    );

    await connection.commit();
    res.json({ success: true, message: "Project deleted successfully" });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}));

app.delete("/api/projects/:id/deadline", requireAuth, asyncHandler(async (req, res) => {
  const projectId = Number(req.params.id);
  const user = req.user!;

  const [projectRows] = await pool.execute<RowDataPacket[]>(
    "SELECT * FROM projects WHERE project_id = ?",
    [projectId]
  );
  const project = projectRows[0];
  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  if (user.role !== "admin" && (user.role !== "client" || project.client_id !== user.userId)) {
    return res.status(403).json({ message: "You are not authorized to modify this project" });
  }

  await pool.execute("UPDATE projects SET deadline = NULL WHERE project_id = ?", [projectId]);
  res.json({ success: true, message: "Project deadline deleted successfully" });
}));

app.get("/api/proposals", requireAuth, asyncHandler(async (req, res) => {
  const user = req.user!;

  const sql =
    user.role === "client"
      ? `SELECT p.*, u.name AS freelancer_name, pr.title AS project_title
         FROM proposals p
         JOIN users u ON u.user_id = p.freelancer_id
         JOIN projects pr ON pr.project_id = p.project_id
         WHERE pr.client_id = :userId
         ORDER BY p.submitted_at DESC`
      : `SELECT p.*, pr.title AS project_title, u.name AS client_name
         FROM proposals p
         JOIN projects pr ON pr.project_id = p.project_id
         JOIN users u ON u.user_id = pr.client_id
         WHERE p.freelancer_id = :userId
         ORDER BY p.submitted_at DESC`;

  const proposals = await query<RowDataPacket[]>(sql, { userId: user.userId });
  res.json({ proposals });
}));

app.post("/api/proposals", requireAuth, requireRole("freelancer"), asyncHandler(async (req, res) => {
  const body = req.body as Record<string, string | number>;
  requireFields(body, ["project_id", "bid_amount", "estimated_days"]);

  const [projectRows] = await pool.execute<RowDataPacket[]>(
    "SELECT status, client_id FROM projects WHERE project_id = ?",
    [body.project_id]
  );
  const project = projectRows[0];

  if (!project) return res.status(404).json({ message: "Project not found" });
  if (project.status !== "open") return res.status(400).json({ message: "Project is not open for proposals" });
  if (project.client_id === req.user!.userId) {
    return res.status(400).json({ message: "Clients cannot bid on their own projects" });
  }

  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO proposals (project_id, freelancer_id, bid_amount, estimated_days, cover_letter, status)
     VALUES (:projectId, :freelancerId, :bidAmount, :estimatedDays, :coverLetter, 'pending')`,
    {
      projectId: body.project_id,
      freelancerId: req.user!.userId,
      bidAmount: body.bid_amount,
      estimatedDays: body.estimated_days,
      coverLetter: body.cover_letter ?? ""
    }
  );

  res.status(201).json({ proposalId: result.insertId });
}));

app.post("/api/proposals/:id/accept", requireAuth, requireRole("client"), asyncHandler(async (req, res) => {
  const proposalId = Number(req.params.id);
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT pr.client_id
     FROM proposals p
     JOIN projects pr ON pr.project_id = p.project_id
     WHERE p.proposal_id = ?`,
    [proposalId]
  );

  if (!rows[0]) return res.status(404).json({ message: "Proposal not found" });
  if (rows[0].client_id !== req.user!.userId) {
    return res.status(403).json({ message: "Only the project owner can accept this proposal" });
  }

  await pool.query("CALL sp_accept_proposal(?)", [proposalId]);
  const [contract] = await pool.execute<RowDataPacket[]>(
    "SELECT * FROM contracts WHERE proposal_id = ?",
    [proposalId]
  );

  res.json({ contract: contract[0] });
}));

app.get("/api/contracts", requireAuth, asyncHandler(async (req, res) => {
  const user = req.user!;
  const column = user.role === "client" ? "c.client_id" : user.role === "freelancer" ? "c.freelancer_id" : "1";
  const params = user.role === "admin" ? {} : { userId: user.userId };
  const where = user.role === "admin" ? "1 = 1" : `${column} = :userId`;

  const contracts = await query<RowDataPacket[]>(
    `SELECT c.*, pr.title AS project_title, cl.name AS client_name, fl.name AS freelancer_name,
       COUNT(m.milestone_id) AS milestone_count,
       SUM(m.status = 'approved') AS approved_milestones
     FROM contracts c
     JOIN proposals pp ON pp.proposal_id = c.proposal_id
     JOIN projects pr ON pr.project_id = pp.project_id
     JOIN users cl ON cl.user_id = c.client_id
     JOIN users fl ON fl.user_id = c.freelancer_id
     LEFT JOIN milestones m ON m.contract_id = c.contract_id
     WHERE ${where}
     GROUP BY c.contract_id
     ORDER BY c.start_date DESC`,
    params
  );

  res.json({ contracts });
}));

app.get("/api/contracts/:id", requireAuth, asyncHandler(async (req, res) => {
  const [contracts] = await pool.execute<RowDataPacket[]>(
    `SELECT c.*, pr.title AS project_title, pr.description, cl.name AS client_name, fl.name AS freelancer_name
     FROM contracts c
     JOIN proposals pp ON pp.proposal_id = c.proposal_id
     JOIN projects pr ON pr.project_id = pp.project_id
     JOIN users cl ON cl.user_id = c.client_id
     JOIN users fl ON fl.user_id = c.freelancer_id
     WHERE c.contract_id = ?`,
    [req.params.id]
  );
  const contract = contracts[0];

  if (!contract) return res.status(404).json({ message: "Contract not found" });
  if (req.user!.role !== "admin" && ![contract.client_id, contract.freelancer_id].includes(req.user!.userId)) {
    return res.status(403).json({ message: "You do not have access to this contract" });
  }

  const milestones = await query<RowDataPacket[]>(
    "SELECT * FROM milestones WHERE contract_id = :contractId ORDER BY due_date ASC",
    { contractId: Number(req.params.id) }
  );
  const invoices = await query<RowDataPacket[]>(
    "SELECT * FROM invoices WHERE contract_id = :contractId ORDER BY created_at DESC",
    { contractId: Number(req.params.id) }
  );

  res.json({ contract, milestones, invoices });
}));

app.post("/api/contracts/:id/milestones", requireAuth, requireRole("client"), asyncHandler(async (req, res) => {
  const body = req.body as Record<string, string | number>;
  requireFields(body, ["title", "amount", "due_date"]);

  const [contractRows] = await pool.execute<RowDataPacket[]>(
    "SELECT client_id FROM contracts WHERE contract_id = ?",
    [req.params.id]
  );
  if (!contractRows[0]) return res.status(404).json({ message: "Contract not found" });
  if (contractRows[0].client_id !== req.user!.userId) return res.status(403).json({ message: "Not your contract" });

  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO milestones (contract_id, title, amount, due_date, status)
     VALUES (:contractId, :title, :amount, :dueDate, 'pending')`,
    {
      contractId: Number(req.params.id),
      title: body.title,
      amount: body.amount,
      dueDate: body.due_date
    }
  );
  res.status(201).json({ milestoneId: result.insertId });
}));

app.patch("/api/milestones/:id/status", requireAuth, asyncHandler(async (req, res) => {
  const status = String((req.body as { status?: string }).status ?? "");
  if (!["pending", "submitted", "approved"].includes(status)) {
    return res.status(400).json({ message: "Invalid milestone status" });
  }

  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT m.*, c.client_id, c.freelancer_id
     FROM milestones m
     JOIN contracts c ON c.contract_id = m.contract_id
     WHERE m.milestone_id = ?`,
    [req.params.id]
  );
  const milestone = rows[0];
  if (!milestone) return res.status(404).json({ message: "Milestone not found" });

  if (status === "submitted" && milestone.freelancer_id !== req.user!.userId) {
    return res.status(403).json({ message: "Only the freelancer can submit this milestone" });
  }
  if (status === "approved" && milestone.client_id !== req.user!.userId) {
    return res.status(403).json({ message: "Only the client can approve this milestone" });
  }

  await pool.execute("UPDATE milestones SET status = ? WHERE milestone_id = ?", [status, req.params.id]);
  res.json({ ok: true });
}));

app.get("/api/invoices", requireAuth, asyncHandler(async (req, res) => {
  const user = req.user!;
  const where =
    user.role === "client"
      ? "i.client_id = :userId"
      : user.role === "freelancer"
        ? "i.freelancer_id = :userId"
        : "1 = 1";

  const invoices = await query<RowDataPacket[]>(
    `SELECT i.*, pr.title AS project_title, cl.name AS client_name, fl.name AS freelancer_name,
       py.payment_id, py.payment_status, py.payment_method, py.transaction_id
     FROM invoices i
     JOIN contracts c ON c.contract_id = i.contract_id
     JOIN proposals pp ON pp.proposal_id = c.proposal_id
     JOIN projects pr ON pr.project_id = pp.project_id
     JOIN users cl ON cl.user_id = i.client_id
     JOIN users fl ON fl.user_id = i.freelancer_id
     LEFT JOIN payments py ON py.invoice_id = i.invoice_id
     WHERE ${where}
     ORDER BY i.created_at DESC`,
    user.role === "admin" ? {} : { userId: user.userId }
  );
  res.json({ invoices });
}));

app.post("/api/invoices/generate", requireAuth, asyncHandler(async (req, res) => {
  const contractId = Number((req.body as { contract_id?: number }).contract_id);
  if (!contractId) return res.status(400).json({ message: "contract_id is required" });

  const [rows] = await pool.execute<RowDataPacket[]>("SELECT * FROM contracts WHERE contract_id = ?", [contractId]);
  const contract = rows[0];
  if (!contract) return res.status(404).json({ message: "Contract not found" });
  if (req.user!.role !== "admin" && ![contract.client_id, contract.freelancer_id].includes(req.user!.userId)) {
    return res.status(403).json({ message: "You do not have access to this contract" });
  }

  await pool.query("CALL sp_generate_invoice(?)", [contractId]);
  const [invoice] = await pool.execute<RowDataPacket[]>(
    "SELECT * FROM invoices WHERE contract_id = ? ORDER BY invoice_id DESC LIMIT 1",
    [contractId]
  );
  res.status(201).json({ invoice: invoice[0] });
}));

app.post("/api/payments", requireAuth, requireRole("client"), asyncHandler(async (req, res) => {
  const invoiceId = Number((req.body as { invoice_id?: number }).invoice_id);
  const paymentMethod = String((req.body as { payment_method?: string }).payment_method ?? "UPI");
  if (!invoiceId) return res.status(400).json({ message: "invoice_id is required" });
  if (!["UPI", "Card", "Bank", "Wallet"].includes(paymentMethod)) {
    return res.status(400).json({ message: "Invalid payment method" });
  }

  const [rows] = await pool.execute<RowDataPacket[]>("SELECT * FROM invoices WHERE invoice_id = ?", [invoiceId]);
  const invoice = rows[0];

  if (!invoice) return res.status(404).json({ message: "Invoice not found" });
  if (invoice.client_id !== req.user!.userId) return res.status(403).json({ message: "Not your invoice" });
  if (invoice.status === "paid") return res.status(400).json({ message: "Invoice is already paid" });

  const transactionId = `FLF-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`;
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const [result] = await connection.execute<ResultSetHeader>(
      `INSERT INTO payments (invoice_id, payer_id, payee_id, amount_paid, payment_method, payment_status, transaction_id)
       VALUES (?, ?, ?, ?, ?, 'success', ?)`,
      [invoiceId, invoice.client_id, invoice.freelancer_id, invoice.total_amount, paymentMethod, transactionId]
    );
    await connection.execute("UPDATE invoices SET status = 'paid' WHERE invoice_id = ?", [invoiceId]);
    await connection.commit();
    res.status(201).json({ paymentId: result.insertId, transactionId });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}));

app.use((error: Error & { status?: number; code?: string }, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (error.code === "ER_DUP_ENTRY") {
    return res.status(409).json({ message: "Duplicate record blocked by database constraint" });
  }

  const status = error.status ?? 500;
  const message = status === 500 ? "Something went wrong" : error.message;
  if (status === 500) {
    console.error(error);
  }

  return res.status(status).json({ message });
});

app.listen(port, () => {
  console.log(`FreeLanceFlow API running on http://localhost:${port}`);
});
