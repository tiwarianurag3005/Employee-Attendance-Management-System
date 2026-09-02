# Employee Attendance Management System (EAMS)
This is a Full Stack, Enterprise-Grade Web Application for Attendance Management called Employee Attendance Management System (EAMS) — built to automate keeping track of workforce attendance and logging daily attendance, along with managing leaves in an Organisation. It updates obsolete manual registers and spreadsheets with a unified, secure solution—enabling employees to clock their hours and file leave requests conveniently while giving HR personnel administrative power to audit attendance records and approve requests whenever needed.

Key Features

  Role-Based Authentication (RBAC): Distinct permission tiers for Employees and HR administrators, secured using salt hashed passwords and stateless token verification.

  Attendance Check-In / Check-Out: Single-click clock-in and clock-out with server-side validation to prevent duplicate entries on the same calendar day.

  Working Hours Calculation: Dynamic computation of daily working hours derived from check-in and check-out timestamps to determine shift status (such as Full-Day or Half-Day thresholds).

  Leave Deduction Calculation: Automated leave workflow where submitted requests are evaluated against remaining quotas and automatically deducted from the employee's balance upon HR approval.

  Attendance Status Tracking: Real-time visual status badges (Present, Absent, Half-day, On Leave) paired with historical logs for comprehensive auditing.

Dedicated Dashboards:

  Employee Dashboard: Displays personal attendance statistics, remaining leave balances, active session status, and past logs.

  HR Dashboard: Provides an organization-wide view of staff attendance, employee directory management, and an approval/rejection panel for pending leave requests.
