# TourMatch AI - Check-In Driven Stays & Local Guides Ecosystem

> **Strict Technology Stack Enforcement**: Built strictly with **React.js**, **Tailwind CSS**, **Node.js**, **FastAPI**, **Python**, **PyTorch**, **LangChain**, **OpenAI API**, **PostgreSQL**, **MongoDB**, **Redis**, **Docker**, and **AWS**.

---

## 🏛️ System Architecture by Technology

| Layer | Strict Technology | Implementation & Responsibility |
|---|---|---|
| **Frontend** | **React.js & Tailwind CSS** | Cross-platform SPA with interactive Persona Switcher (Traveler, Hotel Partner, Local Guide, Split Engine), Leaflet 5km spatial radar, and live checkout toggle flow. |
| **API Gateway** | **Node.js (Express)** | Core backend REST API in `server-node/` managing authentication, hotel onboarding, guide verification, and automated multi-party split payouts. |
| **AI & ML Microservice** | **Python & FastAPI** | High-performance async microservice in `ai-service/` serving neural ranking models and LLM agent chains. |
| **Neural Ranking Model** | **PyTorch** | `CheckinRankingNet` neural network (`torch.nn.Module`) evaluating tensor-based check-in velocity and spatial proximity (strictly omitting star ratings). |
| **LLM Agent Pipeline** | **LangChain & OpenAI API** | Structured `PydanticOutputParser` and prompt chains extracting traveler constraints (`target_landmark`, `max_budget`, `needs_guide`) and synthesizing stay rationales. |
| **Relational & Spatial DB** | **PostgreSQL (+ PostGIS)** | Database in `database/postgres-init/` storing hotels, guides, bookings, and spatial queries using `ST_DWithin` and `ST_Distance`. |
| **Document Store** | **MongoDB** | Unstructured document store in `database/mongo-init/` for rich hotel photo catalogs, virtual tours, and audit trail logs. |
| **In-Memory Cache** | **Redis** | In-memory key-value store for sub-millisecond Google Maps check-in counters and hot property rankings. |
| **DevOps & Containers** | **Docker & Docker Compose** | Multi-container orchestration in `docker-compose.yml` running Frontend, Node.js, FastAPI, PostgreSQL, MongoDB, and Redis. |
| **Cloud Infrastructure** | **AWS (Amazon Web Services)** | Production deployment architecture in `aws/` leveraging ECS Fargate, RDS PostgreSQL, DocumentDB, ElastiCache Redis, S3, and ALB via CloudFormation. |

---

## 📁 Repository Structure

```
tourmatch/
├── src/                          # React.js + Tailwind CSS UI
│   ├── components/               # Traveler, Hotel Partner, Local Guide, and Split Views
│   ├── services/                 # Spatial, AI, Split, and API Client
│   └── types/                    # Domain models (Postgres & Mongo schemas)
├── server-node/                  # Node.js Express API Gateway
│   ├── src/                      # Express routes, PostgreSQL/MongoDB/Redis clients
│   ├── package.json
│   └── Dockerfile
├── ai-service/                   # Python FastAPI + PyTorch + LangChain Microservice
│   ├── app/
│   │   ├── chains/               # LangChain + OpenAI API prompt chains
│   │   ├── models/               # PyTorch CheckinRankingNet neural model
│   │   └── main.py               # FastAPI endpoints
│   ├── requirements.txt
│   └── Dockerfile
├── database/                     # Database schemas and seed scripts
│   ├── postgres-init/            # PostgreSQL PostGIS schema (ST_DWithin)
│   └── mongo-init/               # MongoDB collection definitions
├── aws/                          # AWS Cloud Infrastructure as Code
│   ├── cloudformation-template.yml
│   ├── ecs-task-definition.json
│   └── architecture.md
├── Dockerfile.frontend           # Multi-stage Nginx build for React
├── docker-compose.yml            # Multi-service container orchestration
└── README.md
```

---

## 🚀 Running with Docker (All Services)

To run the complete 6-service ecosystem locally using Docker:

```bash
# 1. Set your OpenAI API Key (optional, fallback available)
export OPENAI_API_KEY="your-openai-key"

# 2. Build and launch all containers
docker compose up --build
```

This starts:
- **React.js Frontend**: `http://localhost:3000`
- **Node.js API Gateway**: `http://localhost:5000`
- **FastAPI PyTorch AI Service**: `http://localhost:8000`
- **PostgreSQL PostGIS**: `localhost:5432`
- **MongoDB**: `localhost:27017`
- **Redis Cache**: `localhost:6379`

---

## ⚡ Running Locally (Development Mode)

### 1. React.js Frontend
```bash
npm install
npm run dev
```

### 2. Node.js Backend API
```bash
cd server-node
npm install
npm run dev
```

### 3. FastAPI Python Microservice
```bash
cd ai-service
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

---

## 🧪 Verification & Key Flows

1. **Check-In-Driven Ranking (PyTorch)**: Stays are scored using the PyTorch neural network tensor model prioritizing Google Maps check-in footfall (star ratings are completely ignored).
2. **5 km Geo-Radius (PostgreSQL PostGIS)**: Spatial `ST_DWithin` query strictly bounds partner properties around landmarks.
3. **Guide Collaboration Step (Node.js)**: Hotel onboarding allows selecting between *In-House Guide Enrollment* vs *Community Guide Matching*.
4. **Automated Multi-Party Split (Node.js)**:
   - Hotel Net = Room Gross - 15% Platform Commission
   - Guide Net = Guide Fee - 10% Platform Fee - 5% Hotel Referral Fee
   - Hotel Referral Kickback = 5% of Guide Fee
   - Platform Net = Hotel Commission + Guide Fee
5. **Multi-Service Containerization (Docker)**: Verified via `docker-compose.yml`.
6. **Cloud Architecture (AWS)**: Documented with CloudFormation template (`aws/cloudformation-template.yml`) and ECS task definitions.
