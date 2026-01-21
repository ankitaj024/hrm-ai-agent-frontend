"use client";

import { Calendar, CheckCircle2, Clock } from "lucide-react";

interface LeaveStatus {
    employee_name: string;
    leave_balance: number; // Privilege Leave
    short_leaves_taken: number; // Max 2
    recent_requests: Array<{
        date: string;
        leave_type: string;
        status: string;
    }>;
}

export const LeaveBalanceCard = ({ data }: { data: LeaveStatus }) => {
    const plPercentage = Math.min((data.leave_balance / 20) * 100, 100); // Assuming 20 max/year for visualization
    const slPercentage = (data.short_leaves_taken / 2) * 100;

    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-lg shadow-gray-200/50 p-5 w-full max-w-md my-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">Leave Balance</h3>
                <span className="text-xs font-semibold text-gray-400">{data.employee_name}</span>
            </div>

            <div className="space-y-5">
                {/* Privilege Leave */}
                <div>
                    <div className="flex justify-between text-sm mb-1.5">
                        <span className="font-medium text-gray-700">Privilege Leave</span>
                        <span className="font-bold text-emerald-600">{data.leave_balance} Available</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                            style={{ width: `${plPercentage}%` }}
                        ></div>
                    </div>
                </div>

                {/* Short Leave */}
                <div>
                    <div className="flex justify-between text-sm mb-1.5">
                        <span className="font-medium text-gray-700">Short Leaves (Month)</span>
                        <span className="font-bold text-blue-600">{data.short_leaves_taken} / 2 Used</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-500 rounded-full transition-all duration-500"
                            style={{ width: `${slPercentage}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* Recent Requests */}
            {data.recent_requests && data.recent_requests.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-50">
                    <h4 className="text-xs font-semibold uppercase text-gray-400 mb-3 tracking-wider">Recent Activity</h4>
                    <div className="space-y-2">
                        {data.recent_requests.map((req, idx) => (
                            <div key={idx} className="flex items-center justify-between text-sm p-2 rounded-lg bg-gray-50/50 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-2">
                                    <Calendar size={14} className="text-gray-400" />
                                    <span className="font-medium text-gray-700">
                                        {new Date(req.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </span>
                                    <span className="text-xs opacity-60">({req.leave_type})</span>
                                </div>
                                {req.status === "Approved" ? (
                                    <div className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                                        <CheckCircle2 size={12} className="mr-1" /> Approved
                                    </div>
                                ) : req.status === "Pending" ? (
                                    <div className="flex items-center text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded">
                                        <Clock size={12} className="mr-1" /> Pending
                                    </div>
                                ) : (
                                    <div className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded">
                                        {req.status}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
