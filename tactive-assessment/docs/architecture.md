# Architecture Document - EVChargeFlow

## 1. System Overview
EVChargeFlow is a real-time EV charger allocation and queue management system. It dynamically allocates compatible chargers to vehicles, manages a fair queue, and handles real-time updates and fault scenarios without dropping state.

## 2. High-Level Architecture
The system follows a classic three-tier architecture, augmented with a real-time WebSocket layer:
- **Client (Frontend)**: React + Vite + TailwindCSS. Uses HTTP for REST requests and Socket.IO for receiving real-time state changes.
- **Application Server (Backend)**: Node.js + Express. Exposes REST endpoints, runs the core allocation engine, and broadcasts state changes via Socket.IO.
- **Database**: SQLite (via Prisma ORM). Ensures atomic data persistence and simplifies local environment execution.

## 3. Core Components
- **Allocation Engine**: The central logic module. When a charging request arrives or a charger becomes available, it runs the `allocateCharger` algorithm to match vehicles with chargers based on compatibility and queue fairness.
- **Socket Event Broadcaster**: Listens to database and state changes to notify connected clients about updates (e.g., `charger_updated`, `queue_updated`).
- **REST APIs**: Provides endpoints for creating requests, managing chargers, and fetching initial state.

## 4. Data Flow
1. **Charging Request**: Client calls POST `/api/requests`.
2. **Allocation**: Backend validates request and invokes `allocateCharger`.
3. **Database Write**: Prisma updates the Charger and Request tables atomically.
4. **Broadcast**: Backend emits Socket.IO events to all clients.
5. **Client Update**: React state is updated automatically.

## 5. Security & Concurrency
- Concurrency risks (double allocation) are mitigated through transactional database updates and state locking.
- Only authorized users (mocked for simplicity in this assessment scope) can manage charger states.

## 6. Testing Strategy
- **Unit Tests (Vitest)**: Exhaustive testing of the Allocation Engine logic (happy path, edge cases, failures).
- **API Tests**: Validating correct HTTP responses.
- **E2E Tests (Playwright)**: Full browser automation.
