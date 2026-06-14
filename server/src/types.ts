import type { Request } from "express";

export type Role = "client" | "freelancer" | "admin";

export type AuthUser = {
  userId: number;
  role: Role;
  email: string;
  name: string;
};

export type AuthedRequest = Request & {
  user?: AuthUser;
};
