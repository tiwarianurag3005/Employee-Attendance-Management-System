# Employee Attendance Management System (EAMS)
This is a Full Stack, Enterprise-Grade Web Application for Attendance Management called Employee Attendance Management System (EAMS) — built to automate keeping track of workforce attendance and logging daily attendance, along with managing leaves in an Organisation. It updates obsolete manual registers and spreadsheets with a unified, secure solution—enabling employees to clock their hours and file leave requests conveniently while giving HR personnel administrative power to audit attendance records and approve requests whenever needed.

# Key Features

  Role-Based Authentication (RBAC): Distinct permission tiers for Employees and HR administrators, secured using salt hashed passwords and stateless token verification.

  Attendance Check-In / Check-Out: Single-click clock-in and clock-out with server-side validation to prevent duplicate entries on the same calendar day.

  Working Hours Calculation: Dynamic computation of daily working hours derived from check-in and check-out timestamps to determine shift status (such as Full-Day or Half-Day thresholds).

  Leave Deduction Calculation: Automated leave workflow where submitted requests are evaluated against remaining quotas and automatically deducted from the employee's balance upon HR approval.

  Attendance Status Tracking: Real-time visual status badges (Present, Absent, Half-day, On Leave) paired with historical logs for comprehensive auditing.

Dedicated Dashboards:

  Employee Dashboard: Displays personal attendance statistics, remaining leave balances, active session status, and past logs.

  HR Dashboard: Provides an organization-wide view of staff attendance, employee directory management, and an approval/rejection panel for pending leave requests.

# Frontend Overview

The client-side architecture focuses on responsive performance and clean user interactions:

Core Framework: React.js bundled with Vite for rapid hot-module replacement (HMR) and optimized build times.

Styling: Tailwind CSS for modern UI components including responsive tables, action cards, and dynamic status badges.

Routing & Protection: React Router DOM handling client-side navigation, reinforced with custom ProtectedRoute wrappers to restrict unauthorized access to administrative routes.

State Management & Networking: React's Context API (AuthContext) to maintain global user session state across refreshes, paired with Axios for API requests and response interceptors.

# Backend Overview
The server-side layer drives data persistence, role validation, and core business computation:

Runtime & Framework: Node.js with Express.js providing a modular RESTful API architecture.

Database & Modeling: MongoDB managed via Mongoose, structured around three key schemas: User (identity and roles), Attendance (daily timestamps, hours, and status), and Leave (duration, reasons, and approval states).

Security & Middleware:

bcryptjs: Secure one-way hashing of passwords before persistence.

jsonwebtoken (JWT): Stateless session tokens passed via authorization headers to verify incoming requests.

Custom Middlewares: authMiddleware for token validation and hrMiddleware for role-gated endpoint security.

Business Logic: Server-side controllers handle the core mathematical logic—converting timestamp differentials into exact working hours and managing atomic database transactions during leave approvals.
