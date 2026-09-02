import React from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, User as UserIcon } from "lucide-react";

const Navbar = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    return (
        <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo / Brand Name */}
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-600/20">
                            E
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-white tracking-tight">
                                EAMS
                            </span>
                            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                                {user.role || "PORTAL"}
                            </span>
                        </div>
                    </div>

                    {/* User Profile & Logout */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2.5 bg-slate-800/80 px-3.5 py-1.5 rounded-xl border border-slate-700/60">
                            <div className="text-right">
                                <p className="text-xs font-bold text-white leading-none">
                                    {user.name || "User"}
                                </p>
                                <p className="text-[10px] font-medium text-slate-400 mt-0.5 leading-none">
                                    {user.department ? `${user.department} Dept` : "Employee"}
                                </p>
                            </div>
                            <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center text-slate-300 border border-slate-600">
                                <UserIcon className="w-4 h-4" />
                            </div>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-xl text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all cursor-pointer"
                        >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;