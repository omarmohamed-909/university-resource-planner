# University Resource Planner (ََََQNU)

A comprehensive, AI-powered University Resource Planner built with the MERN stack. SVNU streamlines the management of university schedules, halls, courses, and attendance, providing specialized dashboards for Administrators, Doctors, and Students.

## 🌟 Key Features

- **AI Auto-Scheduling:** Utilizes a Genetic Algorithm to automatically generate optimal, conflict-free schedules for the university.
- **Smart Attendance:** Integrated QR Code system for fast, secure student attendance tracking.
- **Role-Based Access Control (RBAC):** Tailored dashboards and permissions for:
  - **Admins:** Manage users, courses, halls, and generate schedules.
  - **Doctors:** View schedules, manage swap requests, and track student attendance.
  - **Students:** View personal schedules and register attendance via QR.
- **Schedule Swapping System:** Seamlessly handle schedule swap requests between doctors.
- **Real-time Updates:** Integrated WebSocket support for live notifications and updates.

## 🛠️ Tech Stack

- **Frontend:** React (Vite), Tailwind CSS, Modern UI Components
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose)
- **Architecture:** Clean Architecture principles

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/omarmohamed-909/university-resource-planner.git
   cd university-resource-planner
   ```

2. **Install Server Dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install Client Dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Environment Setup**
   - Create a `.env` file in the `server` directory and add your environment variables (MongoDB URI, JWT Secret, etc.).
   - Create a `.env` file in the `client` directory for frontend variables.

5. **Run the Application**
   - **Start Backend:** `npm run dev` (inside the `server` directory)
   - **Start Frontend:** `npm run dev` (inside the `client` directory)

## 🤝 Contributing
Contributions, issues, and feature requests are welcome!
