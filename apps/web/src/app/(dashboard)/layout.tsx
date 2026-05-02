import { redirect } from "next/navigation";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { cookies } from "next/headers";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("picadito_access_token")?.value;

    if (!accessToken) redirect("/login");

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            <DashboardNav profile={null} />
            <div className="flex flex-1 flex-col overflow-hidden">
                <DashboardHeader profile={null} unreadCount={0} />
                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
