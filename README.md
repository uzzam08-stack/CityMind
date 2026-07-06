# CityMind
**Team CodeBenders** | *Optimizing PCMC Construction & Demolition (C&D) waste management through AI-driven decision intelligence.*

---

## 🏛️ Project Overview
CityMind is a hyper-local, AI-powered Decision Intelligence Platform built for the Pimpri-Chinchwad Municipal Corporation (PCMC). We address the specific bottleneck of reactive Construction & Demolition (C&D) waste management by engineering a closed-loop system that ingests simulated C&D waste data (grounded in actual PCMC factsheets and transfer station coordinates) and actively responds to anomalies like illegal dumping.

## 🏗️ Architecture

```text
+-------------------+       +---------------+       +------------------+
|                   |       |               |       |                  |
|  Sensors / Drones +-------> Cloud Storage +------->   BigQuery       |
|                   |       |               |       |                  |
+-------------------+       +---------------+       +--------+---------+
                                                             |
                                                             |
+-------------------+       +---------------+       +--------v---------+
|                   |       |               |       |                  |
| React Dashboard   <-------+ Gemini Flash  <-------+ NVIDIA RAPIDS    |
| (CityMind App)    |       | (Vision / NLP)|       | (cuDF / GPU)     |
+-------------------+       +---------------+       +------------------+
```

## 🚀 The Tech Flex: 14x GPU Acceleration
To handle the massive spatial calculations required for PCMC's 9,700+ registered construction zones, we integrated **NVIDIA RAPIDS cuDF**. 

This zero-code-change GPU acceleration replaced standard Python CPU processing for our Haversine routing matrix calculations. This upgrade dropped our matrix computation latency from **8.4 seconds to 0.6 seconds—a 14x speedup** that allows for real-time, automated truck dispatch at a city-wide scale.

## 💡 Key Features
* **Multimodal C&D Waste Pipeline:** Upload images of illegal dumping. Gemini 1.5 Flash Vision automates volume estimation and statutory penalty calculation instantly.
* **Natural Language Queries:** Use our RAG-powered chat interface to query BigQuery databases using plain English.
* **GPU-Accelerated Route Optimization:** Real-time optimization using NVIDIA RAPIDS cuDF to route the closest transport unit to critical bins and transfer stations.

## ⚡ Quick Start

Follow these instructions to run the application locally using Docker.

1. **Clone the repository:**
   ```bash
   git clone <repo_url>
   cd citymind
   ```

2. **Configure Environment:**
   ```bash
   cp .env.example .env
   # Add your Google Cloud & Gemini credentials in the .env file.
   # By default, DEMO_MODE=true is enabled so the app will run with synthetic data.
   ```

3. **Build & Run:**
   ```bash
   docker-compose up --build
   ```

4. **Access the Application:**
   * Frontend (Dashboard): `http://localhost:5173`
   * Backend (API): `http://localhost:8000/docs`
