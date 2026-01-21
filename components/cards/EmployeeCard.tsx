"use client";

import { User, Mail, Briefcase, MapPin, Building2, Phone } from "lucide-react";

interface Employee {
    name: string;
    email: string;
    role: string;
    department: string;
    designation: string;
    phone_number: string;
    permanent_address?: string;
    [key: string]: any;
}

export const EmployeeCard = ({ data }: { data: Employee }) => {
    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-lg shadow-gray-200/50 p-5 w-full max-w-md my-4">
            <div className="flex items-center gap-4 mb-4 border-b border-gray-50 pb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold">
                    {data.name.charAt(0)}
                </div>
                <div>
                    <h3 className="font-bold text-gray-900 text-lg">{data.name}</h3>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full w-fit mt-1">
                        <Building2 size={12} />
                        <span>{data.department}</span>
                    </div>
                </div>
            </div>

            <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3 text-gray-600">
                    <Briefcase size={16} className="text-gray-400" />
                    <div>
                        <span className="block text-gray-900 font-medium">{data.designation}</span>
                        <span className="text-xs text-gray-400">Designation</span>
                    </div>
                </div>

                <div className="flex items-center gap-3 text-gray-600">
                    <Mail size={16} className="text-gray-400" />
                    <span className="truncate">{data.email}</span>
                </div>

                <div className="flex items-center gap-3 text-gray-600">
                    <Phone size={16} className="text-gray-400" />
                    <span>{data.phone_number}</span>
                </div>

                {data.permanent_address && (
                    <div className="flex items-start gap-3 text-gray-600">
                        <MapPin size={16} className="text-gray-400 mt-0.5" />
                        <span className="text-xs">{data.permanent_address}</span>
                    </div>
                )}
            </div>
        </div>
    );
};
