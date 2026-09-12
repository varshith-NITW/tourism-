# TourMatch AI - AWS Production Cloud Architecture

This document specifies the enterprise cloud architecture deployed on **Amazon Web Services (AWS)** strictly utilizing the designated technology stack.

```mermaid
graph TD
    User["Tourist / Hotel Partner / Guide"]
    
    subgraph AWS Route 53 & Edge
        R53["Amazon Route 53 (DNS)"]
        CF["Amazon CloudFront (CDN)"]
        S3Web["Amazon S3 (React.js + Tailwind SPA)"]
        CF --> S3Web
    end
    
    User --> R53
    R53 --> CF
    R53 --> ALB
    
    subgraph AWS VPC (Virtual Private Cloud)
        ALB["Application Load Balancer (ALB)"]
        
        subgraph AWS ECS Fargate Cluster
            NodeApp["Node.js API Gateway (Express)\n• Auth & Onboarding\n• Booking & Split Engine"]
            FastAPIApp["FastAPI AI Microservice (Python)\n• LangChain + OpenAI API\n• PyTorch Neural Ranking Model"]
        end
        
        ALB -->|Path /api/*| NodeApp
        ALB -->|Path /ai/*| FastAPIApp
        NodeApp -->|Internal Mesh /ai/recommend| FastAPIApp
        
        subgraph AWS Managed Data Stores
            RDS[("Amazon RDS PostgreSQL 16 (PostGIS)\n• Hotels, Guides, Bookings\n• ST_DWithin 5km Spatial Queries\n• Split Settlements Ledger")]
            DocDB[("Amazon DocumentDB (MongoDB)\n• Rich Hotel Photo Catalog\n• Compliance Documents & License Scans\n• Raw LLM Interaction Logs")]
            ElastiCache[("Amazon ElastiCache (Redis 7.2)\n• Real-Time Google Maps Check-In Counters\n• Hot Stay Ranking Cache\n• Session Tokens")]
        end
        
        NodeApp --> RDS
        NodeApp --> DocDB
        NodeApp --> ElastiCache
        FastAPIApp --> ElastiCache
        FastAPIApp -->|External HTTPS| OpenAI["OpenAI API (GPT-4o-mini)"]
    end
```

---

## AWS Services Mapping

| Required Technology | AWS Native Service | Role & Functionality |
|---|---|---|
| **React.js & Tailwind CSS** | **Amazon S3 + CloudFront** | Static single-page application hosting with global edge caching |
| **Node.js** | **AWS ECS (Fargate)** | Containerized REST API Gateway handling bookings, partner onboarding, and payment split math |
| **FastAPI, Python, PyTorch, LangChain** | **AWS ECS (Fargate)** | Containerized AI service executing PyTorch tensor check-in scoring and LangChain prompt extraction |
| **OpenAI API** | **AWS Secrets Manager + Outbound NAT** | Secure credential management and invocation of OpenAI LLM models |
| **PostgreSQL** | **Amazon RDS PostgreSQL (PostGIS)** | Relational ACID bookings, partner listings, and spatial radius queries (`ST_DWithin`) |
| **MongoDB** | **Amazon DocumentDB** | Unstructured property photos, virtual tours, and audit trail documents |
| **Redis** | **Amazon ElastiCache Redis** | Sub-millisecond cache for Google Maps check-in counters and hot property lists |
| **Docker** | **Amazon Elastic Container Registry (ECR)** | Container images stored in ECR and orchestrated via ECS Fargate |
