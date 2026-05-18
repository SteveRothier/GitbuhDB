import { NextRequest } from "next/server";

export function verifyCronAuth(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  return Boolean(secret && authHeader === `Bearer ${secret}`);
}
