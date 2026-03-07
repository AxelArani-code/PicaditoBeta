import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    const { data: unreadNotifications } = await supabase
        .from("notifications")
        .select("id", { count: "exact" })
        .eq("user_id", user.id)
        .eq("read", false);

    const unreadCount = unreadNotifications?.length ?? 0;

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            <DashboardNav profile={profile} />
            <div className="flex flex-1 flex-col overflow-hidden">
                <DashboardHeader profile={profile} unreadCount={unreadCount} />
                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
