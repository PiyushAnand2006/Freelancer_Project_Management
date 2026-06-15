import axios from "axios";

export type Role = "client" | "freelancer" | "admin";

export type User = {
  userId: number;
  name: string;
  email: string;
  role: Role;
  isVerified: boolean;
};

export type Project = {
  project_id: number;
  client_id: number;
  client_name: string;
  title: string;
  description?: string;
  budget_min: number;
  budget_max: number;
  deadline: string | null;
  project_type: "fixed" | "hourly";
  status: "open" | "in_progress" | "completed";
  proposal_count: number;
};

export type Proposal = {
  proposal_id: number;
  project_id: number;
  freelancer_id: number;
  freelancer_name?: string;
  client_name?: string;
  project_title: string;
  bid_amount: number;
  estimated_days: number;
  cover_letter?: string;
  status: "pending" | "accepted" | "rejected";
  submitted_at: string;
};

export type Contract = {
  contract_id: number;
  proposal_id: number;
  client_id: number;
  freelancer_id: number;
  project_title: string;
  client_name: string;
  freelancer_name: string;
  agreed_amount: number;
  start_date: string;
  status: "active" | "completed" | "disputed" | "terminated";
  milestone_count?: number;
  approved_milestones?: number;
};

export type Milestone = {
  milestone_id: number;
  contract_id: number;
  title: string;
  amount: number;
  due_date: string;
  status: "pending" | "submitted" | "approved";
};

export type Invoice = {
  invoice_id: number;
  contract_id: number;
  freelancer_id: number;
  client_id: number;
  project_title: string;
  client_name: string;
  freelancer_name: string;
  total_amount: number;
  status: "unpaid" | "paid" | "overdue";
  due_date: string;
  payment_method?: string;
  payment_status?: string;
  transaction_id?: string;
};

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:4000/api"
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("flf_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function formatMoney(value: number | string | null | undefined) {
  const amount = Number(value ?? 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "No deadline";
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return "No deadline";
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }).format(d);
  } catch {
    return "No deadline";
  }
}
