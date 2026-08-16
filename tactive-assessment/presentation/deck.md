# EVChargeFlow - Real-Time EV Charger Allocation & Queue Management

## 1. The Core Problem
- **Resource Scarcity**: EV chargers are limited, but demand is high and dynamic.
- **Compatibility Constraints**: Not all vehicles can use all chargers (e.g. CCS vs Type 2).
- **Concurrency**: Multiple drivers requesting chargers simultaneously can lead to double-allocations or unfair queue jumping.
- **State Complexity**: Chargers fail, go offline, or have active sessions interrupted unexpectedly.

## 2. Our Approach
We chose to focus exclusively on the core **Allocation Engine & Queue Management**.
Instead of building a shallow product with maps, payments, and billing, we engineered a robust system that handles real-time concurrency, state transitions, and strict business rules.

**Technology Stack:**
- **Frontend**: React + TypeScript + Vite + TailwindCSS
- **Backend**: Node.js + Express + Prisma (SQLite for local assessment)
- **Real-Time**: Socket.IO for instant state synchronization across all connected clients.

## 3. The Architecture
- **Browser Client**: Listens to Socket.IO broadcasts and updates the UI instantly without polling.
- **Express Server**: Exposes REST APIs for basic querying and Socket.IO endpoints for real-time transactional actions.
- **Allocation Engine**: The brain. Evaluates vehicle compatibility, checks charger availability safely, executes state transitions atomically, and manages the priority queue.
- **Database**: Single source of truth.

## 4. Solving the Edge Cases (Stage 3 Highlight)
**What happens if a charger fails during an active session?**
Our system instantly intercepts the fault via the `handleChargerFault` service. 
- The active session is interrupted.
- The system automatically re-evaluates the entire facility for another compatible charger.
- If one exists, the vehicle is seamlessly moved. 
- If none exists, the vehicle is placed at the **front of the queue** (retaining its original priority timestamp), ensuring fairness.

## 5. Live Demo
We will now demonstrate:
1. The Real-Time Dashboard
2. Requesting a Charger (Happy Path)
3. The Queue System (No compatible chargers available)
4. Triggering a Charger Fault (Stage 3 Feature)
5. Automatic Reallocation and Priority Queue popping.
