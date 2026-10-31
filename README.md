# RadMed USMLE & AI Radiology Platform 🩺🩻

A full-stack, responsive medical board preparation and diagnostic radiology platform featuring high-yield clinical vignettes, an interactive diagnostic imaging workstation, an AI Rad Bot clinical reasoning engine, and a real-time administrative oversight and analytics dashboard.

---

## 🌟 Key Features

### 1. 📱 Responsive Multi-Device Study Workstation
* **Cross-Device UI**: Seamless experience across mobile phones (bottom thumb navigation), iPads/tablets (split-screen case review), and laptops/desktops.
* **USMLE Exam Simulator**:
  * **Timed Exam Mode**: Countdown timer simulating realistic USMLE Step 1/Step 2 CK pacing.
  * **Tutor Practice Mode**: Instant explanations, distractor breakdown, and high-yield board pearls.
* **Interactive Radiology Viewer**:
  * Invert contrast (simulate bone vs. soft tissue windows).
  * Zoom and pan on diagnostic scans.
  * Toggle anatomical and radiologic annotations on demand.

### 2. 🤖 Specialized AI Rad Bot Assistant
* **Clinical & Radiologic Reasoning Engine**:
  * Pre-loaded with high-yield board associations (e.g., Steeple sign, Thumbprint sign, Coffee bean sign, Apple core sign, Target sign, Rigler sign, Sail sign, etc.).
  * Systematic imaging approach guides (Chest X-Ray ABCDE, Non-contrast Head CT "Blood Can Be Very Bad").
  * Differential diagnosis generator for complex clinical findings (e.g., ring-enhancing brain lesions, anterior mediastinal masses).
* **Case Integration**: Students can click **"Discuss Case with Rad Bot"** directly while reviewing any QBank question.
* **Persistent Chat Drawer**: Accessible from anywhere in the platform.

### 3. 👑 Real-Time Admin Command Center
Accessible by logging in with an Admin account (`admin@radmed.local`):
* **Live User Activity Stream**: Real-time audit trail of user logins, IP addresses, device user-agents, questions answered, and test submissions.
* **User Management**:
  * View all registered students.
  * Upgrade/downgrade tiers (`Free` ↔ `Premium VIP`).
  * Grant/revoke Administrator privileges.
  * Suspend/activate accounts.
* **Rad Bot Chat Audit**: Review all queries students are asking the AI assistant to identify high-yield topics needing extra focus.
* **QBank CMS & Bulk Importer**:
  * Add, edit, or delete questions and case vignettes.
  * Bulk import questions via JSON.
  * Export the entire question bank to JSON with one click.
* **Brand Customization**: Configure platform name and announcement banners directly in the dashboard.

### 4. 💎 Tiered Premium System
* **Free Tier**: Access to core high-yield introductory cases and standard Rad Bot assistance.
* **Premium VIP Tier**: Full access to advanced multi-slice radiology cases, full explanations, uncal herniation trauma series, and priority Rad Bot access.

---

## 🚀 Getting Started Locally

### Prerequisites
* **Node.js**: v18+ (verified on Node v24)
* **npm**: v9+

### 1. Start the Server
From the root directory (`d:\usmleapp`):
```bash
npm start
```
The server will boot on `http://localhost:5000`.

### 2. Open in Your Browser
Open your browser and navigate to:
```
http://localhost:5000
```

---

## 🔑 Demo Accounts (Pre-configured)

Use the 1-click login buttons in the Sign In modal or enter the credentials below:

| Role | Email | Password | Tier | Capabilities |
| :--- | :--- | :--- | :--- | :--- |
| **Administrator** | `admin@radmed.local` | `Admin123!` | Premium VIP | Full access + Admin Control Center |
| **Premium Student** | `sarah.jenkins@usmle.com` | `Student123!` | Premium VIP | Full QBank + AI Rad Bot |
| **Free Student** | `michael.chen@usmle.com` | `Student123!` | Free Tier | Free cases + In-app upgrade option |

---

## 📁 Project Architecture

```
d:\usmleapp\
├── package.json          # Dependencies & npm scripts
├── server\
│   ├── index.js          # Express 5 REST API & static file server
│   ├── db.js             # Atomic, zero-dependency persistent JSON database engine
│   ├── radbot.js         # AI Rad Bot clinical reasoning engine & knowledge base
│   └── seed.js           # Database seeder with USMLE cases & sample users
├── public\
│   ├── index.html        # Responsive Single Page Application shell (Tailwind CSS)
│   ├── js\
│   │   └── app.js        # Frontend router, state management, exam player, admin UI
│   └── assets\
│       └── logo.svg      # Custom SVG vector brand logo
└── data\
    └── db.json           # Persistent application database (created on first run)
```

---

## ☁️ Deployment Guide (Ready for Production)

### Option A: Railway / Render / VPS
1. Connect your GitHub repository to Railway or Render.
2. Build Command: `npm install`
3. Start Command: `npm start`
4. Set environment variable: `PORT=5000` (or leave default assigned by platform)

### Option B: Docker
Create a `Dockerfile`:
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```
Build and run:
```bash
docker build -t radmed-usmle .
docker run -p 5000:5000 radmed-usmle
```
