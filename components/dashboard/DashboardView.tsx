"use client";
import { useEffect, useState } from "react";
import { StatsOverview } from "./StatsOverview";
import { DepartmentChart } from "./DepartmentChart";
import { LeaveStatusChart } from "./LeaveStatusChart";
import { Loader2 } from "lucide-react";

export const DashboardView = () => {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            const token = localStorage.getItem("hr_agent_token");
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

            try {
                const res = await fetch(`${apiUrl}/api/v1/analytics/dashboard-stats`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (err) {
                console.error("Failed to fetch dashboard stats", err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center p-12">
                <Loader2 size={40} className="animate-spin text-blue-500" />
            </div>
        );
    }

    if (!stats) {
        return <div className="p-8 text-center text-gray-500">Failed to load dashboard data.</div>;
    }

    return (
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth bg-gray-50/30">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Overview</h2>

            <StatsOverview data={stats} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DepartmentChart data={stats.department_distribution || []} />
                <LeaveStatusChart data={stats.leave_stats.distribution || []} />
            </div>
        </div>
    );
};
