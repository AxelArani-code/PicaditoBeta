import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { DashboardShell } from "./DashboardShell";

// ─── Layout (server) ──────────────────────────────────────────────────────────

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("picadito_access_token")?.value;

    if (!accessToken) redirect("/login");

    return <DashboardShell>{children}</DashboardShell>;
}
