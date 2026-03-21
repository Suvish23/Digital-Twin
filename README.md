# 🏗️ Digital Twin Platform

A real-time 3D digital twin system built as part of my Master's Research Project at **Bauhaus-Universität Weimar**. The platform mirrors physical asset states in an interactive browser-based 3D environment by integrating live IoT sensor data with a Python processing backend and a Three.js frontend.

---

## 🎯 What it does

Traditional asset monitoring relies on dashboards of raw numbers. This platform replaces that with a **live 3D representation** of the physical system — letting operators see what's happening spatially and in real time, without specialized hardware or software.

- IoT sensors stream data to a Python backend
- The backend processes, validates, and normalises the data
- The React + Three.js frontend renders the physical state as an interactive 3D scene
- Changes in the real world update the 3D model in near real time

---

## 🛠️ Tech stack

| Layer | Technologies |
|---|---|
| Frontend | React, Three.js, WebGL |
| Backend | Python |
| Data pipeline | IoT sensor integration, real-time data processing |
| Visualisation | Three.js 3D scene, WebGL rendering |

---

## 📸 Screenshots

> <img width="500" height="470" alt="Screenshot 2026-03-21 174951" src="https://github.com/user-attachments/assets/31d0039c-da20-4944-9b77-5064055bc8d3" />
> <img width="500" height="467" alt="Screenshot 2026-03-21 175232" src="https://github.com/user-attachments/assets/5970f619-cfbf-41cf-9933-0e172942fe00" />
> <img width="500" height="578" alt="Screenshot 2026-03-21 175128" src="https://github.com/user-attachments/assets/8483d519-02c8-4d66-b3bd-fd83f768948f" />




---

## 🚀 Getting started

### Prerequisites
- Node.js 18+
- Python 3.9+
- npm or yarn

### Installation

```bash
# Clone the repo
git clone https://github.com/Suvish23/Digital-Twin.git
cd Digital-Twin

# Install frontend dependencies
cd client
npm install

# Install backend dependencies
cd ../server
pip install -r requirements.txt
```

### Running the app

```bash
# Start the Python backend
cd server
python main.py

# Start the React frontend
cd client
npm start
```

---

## 📐 Architecture

```
IoT Sensors
    │
    ▼
Python Backend  ──── data processing, validation, normalisation
    │
    ▼
REST API / WebSocket
    │
    ▼
React Frontend ──── Three.js 3D scene, real-time state updates
```

---

## 📄 Project

This project was developed as part of my Master's Research Project in Computer Science for Digital Media at Bauhaus-Universität Weimar.

> 📎 https://drive.google.com/file/d/15oFVmII8tfelYPcZ2JbETzj1WI0-mFoX/view?usp=sharing ← 

---

## 👤 Author

**Suvish Sunilkumar Jain**
[LinkedIn](https://www.linkedin.com/in/suvish-sunilkumar-jain-702766168) · [GitHub](https://github.com/Suvish23)

