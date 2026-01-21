import { Users, Clock, CheckCircle } from "lucide-react";

interface StatsProps {
    data: {
        total_employees: number;
        leave_stats: {
            pending: number;
            approved: number;
        };
    } | null;
}

export const StatsOverview = ({ data }: StatsProps) => {
    if (!data) return null;

    const stats = [
        {
            label: "Total Employees",
            value: data.total_employees,
            icon: Users,
            color: "text-blue-600",
            bg: "bg-blue-50",
            border: "border-blue-100"
        },
        {
            label: "Pending Approvals",
            value: data.leave_stats.pending,
            icon: Clock,
            color: "text-amber-600",
            bg: "bg-amber-50",
            border: "border-amber-100"
        },
        {
            label: "Active Leaves",
            value: data.leave_stats.approved,
            icon: CheckCircle,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
            border: "border-emerald-100"
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {stats.map((stat, i) => (
                <div key={i} className={`p-6 rounded-2xl border ${stat.border} bg-white shadow-sm hover:shadow-md transition-all`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-400 mb-1">{stat.label}</p>
                            <h3 className="text-3xl font-bold text-gray-800">{stat.value}</h3>
                        </div>
                        <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                            <stat.icon size={24} />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
