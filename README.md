# 🚑 AmbuAlert: AI-Powered Emergency Medical Logistics & Digital Twin

![Version](https://img.shields.io/badge/version-1.0.4-blue.svg)
![Status](https://img.shields.io/badge/status-Stable-success.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

Current emergency dispatch systems rely on static maps and manual routing, leading to critical delays caused by unpredictable urban traffic and sudden hospital gridlock. **AmbuAlert** solves this by establishing an intelligent **Healthcare Digital Twin**—a real-time, 3D-ready spatial operating system for emergency response.

---

## 🌟 Key Features

* **🧠 A* Pathfinding AI**: Custom built algorithmic mapping engine dynamically computes absolute fastest route vectors bypassing dynamic urban gridlock.
* **🏥 Predictive Clinical Triage**: Live Decision Engine calculates incoming vitals (HR/SpO2) and automatically paths the patient to the specific specialized facility (Trauma, Cardiac, Pediatric).
* **🤖 Autonomous Self-Healing Grid**: Mid-dispatch, the AI continuously parses the city grid. If a routed hospital's capacity hits zero, AmbuAlert instantly computes a **Diagnostic Pivot** and automatically re-routes the ambulance without human override.
* **🌐 Metaverse & VR Ready**: The backend Node.js physics engine broadcasts active XYZ matrix coordinates at 30 Frame-Per-Second across WebSocket telemetry paths, fully configured for instant 3D WebXR or game-engine virtualization.
* **⚡ Premium High-Fidelity UI**: Zero-latency React HUD built for mass casualty incident commanders. Includes real-time bio-telemetry telemetry tracking and interactive 60FPS fluid mapping.

## 🛠️ Technology Stack

* **Frontend**: React, Vite, Tailwind CSS, MapLibre GL, React-Leaflet
* **Backend**: Node.js, Express
* **Real-time Pipeline**: Socket.IO
* **Routing Algorithm**: Custom A* (A-Star) Heuristic & Haversine Distance Engine

## 🚀 Quick Start

### 1. Backend 
```bash
cd backend
npm install
npm start
```
*Backend runs securely on port `3000`.*

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs securely on port `5173`.*

## 💻 Usage & Operations

1. Navigate to the **[Incident Input Simulator](http://localhost:5173/app/input)** to trigger a live multi-casualty event.
2. Jump to the **[Live Dispatch HUD](http://localhost:5173/app/live)** to review the Incident Commander dashboard.
3. Review the AI's autonomous hospital scoring, select an available Emergency Responder, and hit **ACCEPT**.
4. To test the **Self-Healing Array**, run the manual saturation API mid-mission to crash a hospital's beds to zero and watch the AI Pivot the mission:
   ```bash
   curl -X POST http://localhost:3000/api/test-saturate
   ```

---
*Built aggressively for intelligent healthcare logistics.*
