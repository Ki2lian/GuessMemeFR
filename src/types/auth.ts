import { auth } from "@/lib/auth";

export type Auth = typeof auth;

export type Session = typeof auth.$Infer.Session;

export type User = Session["user"];
