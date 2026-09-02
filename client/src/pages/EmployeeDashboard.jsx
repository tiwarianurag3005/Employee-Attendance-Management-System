import React, { useState, useEffect } from "react";
import API from "../services/api";
import Navbar from "../components/Navbar";
import {
  Clock,
  CalendarCheck,
  CalendarX,
  PlusCircle,
  AlertCircle,
  CheckCircle2,
  Timer,
  Calendar,
  X,
  Loader2,
} from "lucide-react";

const EmployeeDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Leave Modal State
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    leaveType: "CASUAL",
    startDate: "",
    endDate: "",
    reason: "",
  });

  // Current date for disabling past dates in calendar
  const todayDateStr = new Date().toISOString().split("T")[0];

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await API.get("/employee/dashboard");
      setData(res.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCheckIn = async () => {
    try {
      setActionLoading(true);
      setError("");
      setSuccess("");
      const res = await API.post("/attendance/check-in");
      setSuccess(res.data.message || "Checked in successfully!");
      await fetchDashboardData();
    } catch (err) {
      setError(err.response?.data?.message || "Check-in failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setActionLoading(true);
      setError("");
      setSuccess("");
      const res = await API.post("/attendance/check-out");
      setSuccess(res.data.message || "Checked out successfully!");
      await fetchDashboardData();
    } catch (err) {
      setError(err.response?.data?.message || "Check-out failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleApplyLeave = async (e) => {
    e.preventDefault();

    // Frontend validations before API call
    if (leaveForm.startDate < todayDateStr) {
      setError("You cannot apply for leave on past dates");
      return;
    }

    if (leaveForm.startDate > leaveForm.endDate) {
      setError("Start date cannot be after end date");
      return;
    }

    try {
      setActionLoading(true);
      setError("");
      setSuccess("");
      const res = await API.post("/leave/apply", leaveForm);
      setSuccess(res.data.message || "Leave application submitted successfully!");
      setIsLeaveModalOpen(false);
      setLeaveForm({ leaveType: "CASUAL", startDate: "", endDate: "", reason: "" });
      await fetchDashboardData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to apply for leave");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
          <span>Loading your dashboard...</span>
        </div>
      </div>
    );
  }

  const todayAtt = data?.todayAttendance;
  const isCheckedIn = !!todayAtt?.checkIn;
  const isCheckedOut = !!todayAtt?.checkOut;

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

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Notifications */}
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

        {/* Top Header with Action Buttons */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800/50 p-6 rounded-2xl border border-slate-700/60">
          <div>
            <h1 className="text-2xl font-bold text-white">Employee Workspace</h1>
            <p className="text-sm text-slate-400 mt-1">Manage today's attendance and review your leave records.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsLeaveModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-slate-700 hover:bg-slate-600 text-white border border-slate-600 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-indigo-400" />
              <span>Apply Leave</span>
            </button>

            {!isCheckedIn ? (
              <button
                onClick={handleCheckIn}
                disabled={actionLoading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50"
              >
                <CalendarCheck className="w-4 h-4" />
                <span>Check In Now</span>
              </button>
            ) : !isCheckedOut ? (
              <button
                onClick={handleCheckOut}
                disabled={actionLoading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white shadow-lg shadow-rose-600/20 transition-all cursor-pointer disabled:opacity-50"
              >
                <CalendarX className="w-4 h-4" />
                <span>Check Out</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Shift Completed Today</span>
              </div>
            )}
          </div>
        </div>

        {/* Leave Balance Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/80 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Casual Leave</p>
              <h3 className="text-2xl font-bold text-white mt-1">{data?.leaveBalance?.casual ?? 0}</h3>
              <p className="text-xs text-slate-500 mt-1">Days remaining</p>
            </div>
            <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400">
              <Calendar className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/80 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Sick Leave</p>
              <h3 className="text-2xl font-bold text-white mt-1">{data?.leaveBalance?.sick ?? 0}</h3>
              <p className="text-xs text-slate-500 mt-1">Days remaining</p>
            </div>
            <div className="p-3 bg-rose-500/10 rounded-xl border border-rose-500/20 text-rose-400">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/80 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Paid Leave</p>
              <h3 className="text-2xl font-bold text-white mt-1">{data?.leaveBalance?.paid ?? 0}</h3>
              <p className="text-xs text-slate-500 mt-1">Days remaining</p>
            </div>
            <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-400">
              <Timer className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Today's Status Banner */}
        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/60">
          <h2 className="text-lg font-semibold text-white mb-4">Today's Attendance Status</h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400">Status</span>
              <div className="mt-1">{getStatusBadge(todayAtt?.status || "ABSENT")}</div>
            </div>
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400">Check In</span>
              <p className="text-sm font-medium text-slate-200 mt-1">
                {todayAtt?.checkIn ? new Date(todayAtt.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Not yet"}
              </p>
            </div>
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400">Check Out</span>
              <p className="text-sm font-medium text-slate-200 mt-1">
                {todayAtt?.checkOut ? new Date(todayAtt.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Not yet"}
              </p>
            </div>
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400">Hours Logged</span>
              <p className="text-sm font-semibold text-indigo-400 mt-1">
                {todayAtt?.workingHours ? `${todayAtt.workingHours} hrs` : "0 hrs"}
              </p>
            </div>
          </div>
        </div>

        {/* Tables Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Attendance History */}
          <div className="bg-slate-800/70 rounded-2xl border border-slate-700/80 overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-700/80">
              <h3 className="font-semibold text-white">Attendance Logs</h3>
            </div>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-900/50 text-xs uppercase text-slate-400 border-b border-slate-700">
                  <tr>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3">In / Out</th>
                    <th className="px-5 py-3">Hours</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {data?.attendanceHistory && data.attendanceHistory.length > 0 ? (
                    data.attendanceHistory.map((row) => (
                      <tr key={row._id} className="hover:bg-slate-700/20">
                        <td className="px-5 py-3 font-medium text-white">{row.date}</td>
                        <td className="px-5 py-3 text-xs text-slate-400">
                          {row.checkIn ? new Date(row.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "-"} / {" "}
                          {row.checkOut ? new Date(row.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "-"}
                        </td>
                        <td className="px-5 py-3 font-semibold text-slate-200">{row.workingHours} hrs</td>
                        <td className="px-5 py-3">{getStatusBadge(row.status)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-5 py-8 text-center text-slate-500 text-sm">
                        No attendance logs recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Leave History */}
          <div className="bg-slate-800/70 rounded-2xl border border-slate-700/80 overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-700/80">
              <h3 className="font-semibold text-white">Leave Applications</h3>
            </div>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-900/50 text-xs uppercase text-slate-400 border-b border-slate-700">
                  <tr>
                    <th className="px-5 py-3">Type</th>
                    <th className="px-5 py-3">Duration</th>
                    <th className="px-5 py-3">Days</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {data?.leaveHistory && data.leaveHistory.length > 0 ? (
                    data.leaveHistory.map((leave) => (
                      <tr key={leave._id} className="hover:bg-slate-700/20">
                        <td className="px-5 py-3 font-medium text-white">{leave.leaveType}</td>
                        <td className="px-5 py-3 text-xs text-slate-400">
                          {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-3 font-semibold text-slate-200">{leave.numberOfDays}</td>
                        <td className="px-5 py-3">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                              leave.status === "APPROVED"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : leave.status === "REJECTED"
                                ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            }`}
                          >
                            {leave.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-5 py-8 text-center text-slate-500 text-sm">
                        No leave requests submitted yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Apply Leave Modal */}
      {isLeaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-700">
              <h3 className="text-lg font-bold text-white">Apply for Leave</h3>
              <button
                onClick={() => setIsLeaveModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplyLeave} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Leave Type</label>
                <select
                  value={leaveForm.leaveType}
                  onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="CASUAL">Casual Leave</option>
                  <option value="SICK">Sick Leave</option>
                  <option value="PAID">Paid Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    min={todayDateStr}
                    value={leaveForm.startDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    min={leaveForm.startDate || todayDateStr}
                    value={leaveForm.endDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Reason</label>
                <textarea
                  required
                  rows={3}
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  placeholder="Reason for taking leave..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsLeaveModalOpen(false)}
                  className="px-4 py-2 text-sm rounded-xl text-slate-400 hover:text-white bg-slate-900 border border-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 text-sm font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-500 cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? "Submitting..." : "Submit Application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDashboard;