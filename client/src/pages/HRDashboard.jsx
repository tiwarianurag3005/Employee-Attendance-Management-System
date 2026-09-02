import React, { useState, useEffect } from "react";
import API from "../services/api";
import Navbar from "../components/Navbar";
import {
  Users,
  UserCheck,
  UserX,
  CalendarDays,
  CheckCircle,
  XCircle,
  AlertCircle,
  CheckCircle2,
  X,
  Loader2,
  Search,
  Building,
  FileText,
  Trash2,
} from "lucide-react";

const HRDashboard = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    onLeaveToday: 0,
    absentToday: 0,
  });
  const [attendanceList, setAttendanceList] = useState([]);
  const [employeesList, setEmployeesList] = useState([]);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("attendance");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchHRData = async () => {
    try {
      setLoading(true);
      setError("");

      const [statsRes, attendanceRes, employeesRes] = await Promise.all([
        API.get("/hr/dashboard"),
        API.get("/hr/attendance"),
        API.get("/hr/employees"),
      ]);

      if (statsRes.data?.statistics) {
        setStats(statsRes.data.statistics);
      }
      if (statsRes.data?.pendingLeaves) {
        setPendingLeaves(statsRes.data.pendingLeaves);
      }

      setAttendanceList(attendanceRes.data?.attendance || []);
      setEmployeesList(employeesRes.data?.employees || []);
    } catch (err) {
      console.error("HR fetch error:", err);
      setError(err.response?.data?.message || "Failed to fetch HR dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHRData();
  }, []);

  const handleLeaveAction = async (leaveId, status) => {
    try {
      setActionLoading(true);
      setError("");
      setSuccess("");
      const res = await API.patch(`/leave/${leaveId}/status`, { status });
      setSuccess(res.data.message || `Leave ${status.toLowerCase()}ed successfully!`);
      await fetchHRData();
    } catch (err) {
      setError(err.response?.data?.message || `Failed to update leave status`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteEmployee = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete employee "${name}"? This will also remove their attendance and leave records.`)) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");
      setSuccess("");
      const res = await API.delete(`/hr/employee/${id}`);
      setSuccess(res.data.message || "Employee deleted successfully!");
      await fetchHRData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete employee");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "PRESENT":
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">PRESENT</span>;
      case "HALF_DAY":
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">HALF DAY</span>;
      case "LEAVE":
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">LEAVE</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">ABSENT</span>;
    }
  };

  const filteredAttendance = attendanceList.filter((att) => {
    const name = att.employee?.name?.toLowerCase() || "";
    const email = att.employee?.email?.toLowerCase() || "";
    const dept = att.employee?.department?.toLowerCase() || "";
    const query = searchTerm.toLowerCase();
    return name.includes(query) || email.includes(query) || dept.includes(query);
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
          <span>Loading HR Management Portal...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-between">
            <div className="flex items-center gap-3 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError("")}><X className="w-4 h-4 cursor-pointer" /></button>
          </div>
        )}

        {success && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-between">
            <div className="flex items-center gap-3 text-sm">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span>{success}</span>
            </div>
            <button onClick={() => setSuccess("")}><X className="w-4 h-4 cursor-pointer" /></button>
          </div>
        )}

        {/* Dashboard Title */}
        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/60">
          <h1 className="text-2xl font-bold text-white">HR Administration</h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time workplace monitoring, employee directory, and leave approvals.
          </p>
        </div>

        {/* KPI Stats Cards - 4 Clean Columns (Total Staff, Present, On Leave, Absent) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Total Staff</span>
              <Users className="w-4 h-4 text-indigo-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mt-2">{stats.totalEmployees}</h3>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Present</span>
              <UserCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <h3 className="text-2xl font-bold text-emerald-400 mt-2">{stats.presentToday}</h3>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">On Leave</span>
              <CalendarDays className="w-4 h-4 text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold text-blue-400 mt-2">{stats.onLeaveToday}</h3>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Absent</span>
              <UserX className="w-4 h-4 text-rose-400" />
            </div>
            <h3 className="text-2xl font-bold text-rose-400 mt-2">{stats.absentToday}</h3>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700/80 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab("attendance")}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === "attendance"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                  : "bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700"
              }`}
            >
              Attendance Logs ({attendanceList.length})
            </button>

            <button
              onClick={() => setActiveTab("leaves")}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === "leaves"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                  : "bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700"
              }`}
            >
              <span>Leave Approvals</span>
              {pendingLeaves.length > 0 && (
                <span className="px-2 py-0.5 text-xs bg-amber-500/20 text-amber-300 rounded-full border border-amber-500/30">
                  {pendingLeaves.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("employees")}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === "employees"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                  : "bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700"
              }`}
            >
              Employee Directory ({employeesList.length})
            </button>
          </div>

          {activeTab === "attendance" && (
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search name, email, dept..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}
        </div>

        {/* Tab 1: Attendance Logs */}
        {activeTab === "attendance" && (
          <div className="bg-slate-800/70 rounded-2xl border border-slate-700/80 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-900/60 text-xs uppercase text-slate-400 border-b border-slate-700">
                  <tr>
                    <th className="px-6 py-4">Employee</th>
                    <th className="px-6 py-4">Department</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Check-In / Out</th>
                    <th className="px-6 py-4">Hours</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {filteredAttendance.length > 0 ? (
                    filteredAttendance.map((row) => (
                      <tr key={row._id} className="hover:bg-slate-700/20 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-white">{row.employee?.name || "Unknown"}</p>
                            <p className="text-xs text-slate-400">{row.employee?.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 text-xs text-slate-300 bg-slate-900/60 px-2.5 py-1 rounded-md border border-slate-700">
                            <Building className="w-3 h-3 text-slate-500" />
                            {row.employee?.department || "General"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-300 font-medium">{row.date}</td>
                        <td className="px-6 py-4 text-xs text-slate-400">
                          {row.checkIn ? new Date(row.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "-"} / {" "}
                          {row.checkOut ? new Date(row.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "-"}
                        </td>
                        <td className="px-6 py-4 font-semibold text-indigo-400">{row.workingHours} hrs</td>
                        <td className="px-6 py-4">{getStatusBadge(row.status)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-slate-500">
                        No attendance records match the filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Leave Approvals */}
        {activeTab === "leaves" && (
          <div className="bg-slate-800/70 rounded-2xl border border-slate-700/80 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-900/60 text-xs uppercase text-slate-400 border-b border-slate-700">
                  <tr>
                    <th className="px-6 py-4">Employee</th>
                    <th className="px-6 py-4">Leave Type</th>
                    <th className="px-6 py-4">Duration</th>
                    <th className="px-6 py-4">Days</th>
                    <th className="px-6 py-4">Reason</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {pendingLeaves.length > 0 ? (
                    pendingLeaves.map((leave) => (
                      <tr key={leave._id} className="hover:bg-slate-700/20 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-white">{leave.employee?.name || "Employee"}</p>
                            <p className="text-xs text-slate-400">{leave.employee?.department} Dept</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium text-white">{leave.leaveType}</td>
                        <td className="px-6 py-4 text-xs text-slate-400">
                          {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 font-semibold text-indigo-400">{leave.numberOfDays}</td>
                        <td className="px-6 py-4 text-xs text-slate-300 max-w-xs truncate">{leave.reason}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleLeaveAction(leave._id, "APPROVED")}
                              disabled={actionLoading}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all cursor-pointer disabled:opacity-50"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => handleLeaveAction(leave._id, "REJECTED")}
                              disabled={actionLoading}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white transition-all cursor-pointer disabled:opacity-50"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                        <FileText className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                        No pending leave requests to review.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Employee Directory */}
        {activeTab === "employees" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {employeesList.map((emp) => (
              <div
                key={emp._id}
                className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/80 space-y-4 shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white">{emp.name}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{emp.email}</p>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {emp.department}
                    </span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-700/60">
                    <p className="text-xs font-medium text-slate-400 mb-2">Leave Balances</p>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-700/50">
                        <span className="text-[10px] text-slate-400 uppercase">Casual</span>
                        <p className="text-sm font-bold text-indigo-400 mt-0.5">{emp.leaveBalance?.casual ?? 0}</p>
                      </div>
                      <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-700/50">
                        <span className="text-[10px] text-slate-400 uppercase">Sick</span>
                        <p className="text-sm font-bold text-rose-400 mt-0.5">{emp.leaveBalance?.sick ?? 0}</p>
                      </div>
                      <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-700/50">
                        <span className="text-[10px] text-slate-400 uppercase">Paid</span>
                        <p className="text-sm font-bold text-amber-400 mt-0.5">{emp.leaveBalance?.paid ?? 0}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => handleDeleteEmployee(emp._id, emp.name)}
                    disabled={actionLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Employee</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default HRDashboard;