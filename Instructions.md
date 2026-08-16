# Tactive Assessment — EVChargeFlow

## 1. Assessment Source

This project is based on the **AI-Powered QA Automation, Documentation & Software Engineering Assessment — Internship Hiring Assessment | Tactive**.

The assessment is a one-week, build-it-yourself exercise. The candidate is expected to build a small working web application, use AI tooling to generate and run automated tests, make a feature change through an AI-driven test/fix loop, produce professional documentation, and record a short demo.

The assessment explicitly encourages AI use. It evaluates the quality of the resulting system, engineering judgement, the ability to close the build → test → fix loop, security/correctness, communication, and honesty about failures.

> Important: A working, honestly documented partial solution is preferable to a polished system that does not actually run.

---

## 2. Selected Project

### Project Name

**EVChargeFlow — Real-Time EV Charger Allocation & Queue Management System**

### Core Problem

Build a focused real-time application for managing a limited set of EV charging chargers.

The central engineering problem is:

> How can a charging facility dynamically allocate limited compatible chargers to vehicles while maintaining queue fairness, preventing conflicting assignments, handling charger failures, and keeping connected clients synchronized in real time?

This is intentionally **not** a complete EV platform.

We will not build payments, maps, navigation, electricity billing, advanced analytics, mobile apps, or physical IoT hardware.

The project will focus on one meaningful functionality: **charger allocation and queue management**.

---

## 3. Why This Project Was Selected

Inventory, canteen ordering, library systems, leave approval, and generic booking systems were intentionally avoided because they are common assessment choices.

EVChargeFlow provides a less-familiar but understandable real-world problem with:

- Real-time state changes
- Resource allocation
- Queue management
- Compatibility rules
- State transitions
- Concurrency risks
- Failure handling
- Authentication and authorization
- Input validation
- Automated testing opportunities
- A visually strong live demo
- A meaningful AI feature-change loop

The project is deliberately scoped so that it can be completed within the one-week assessment while still demonstrating engineering depth.

---

## 4. Assessment Requirements From the Brief

### Stage 1 — Build a Web Application

The assessment requires:

- A real scenario with rules and edge cases.
- One specific functionality implemented properly instead of many shallow features.
- Any technology stack is allowed.
- The application must run from the repository using the README.

### Stage 2 — AI-Generated Test Automation

Tests must cover:

- Normal path
- Edge cases
- Invalid inputs

The test suite must genuinely be able to fail.

A deliberate application break must be demonstrated, with a captured **red test run** proving that the tests detect the defect.

### Stage 3 — AI Change Loop

This is the core of the assessment.

The AI must be given a new feature request and used to:

1. Implement the change.
2. Run the existing test suite.
3. Detect failures.
4. Correct the implementation.
5. Rerun until the suite passes.

Evidence must record:

- Prompts
- Changes made
- Failed tests
- Diagnosis
- Corrections
- Number of attempts
- Any manual intervention

Failures must be reported honestly.

### Stage 4 — Documentation

Produce:

1. Architecture document
2. Design document
3. User guide

### Required Deliverables

1. Source repository containing application, tests, and README.
2. Test suite and captured output, including a deliberate red run.
3. AI change-loop evidence log.
4. Architecture, Design, and User Guide.
5. Presentation deck.
6. Five-minute video:
   - 2 minutes: problem → approach → solution
   - 3 minutes: live demo

---

## 5. Evaluation Strategy

The assessment weights are:

- Completeness of solution — **25%**
- Complexity and ambition — **20%**
- Innovation in AI orchestration — **20%**
- Security — **15%**
- Documentation and communication — **15%**
- Handling of failure — **5%**

Therefore, the project should prioritize:

1. Actually working software.
2. A meaningful allocation problem.
3. Strong automated tests.
4. A genuine AI change/fix loop.
5. Security.
6. Clear evidence and documentation.

---

## 6. Core Functionality

The primary code under test is the **Charger Allocation Engine**.

Conceptually:

`allocateCharger(chargingRequest, availableChargers, queue)`

Its responsibility is to:

1. Receive a charging request.
2. Find compatible chargers.
3. Determine whether a compatible charger is available.
4. Select the appropriate charger.
5. Reserve it safely.
6. Start a charging session.
7. Otherwise place the vehicle into the correct queue.
8. Reattempt allocation when charger availability changes.

The allocation engine is the heart of the project. The dashboard is primarily a visualization and interaction layer.

---

## 7. Charger State Model

A charger can have states such as:

- AVAILABLE
- RESERVED
- CHARGING
- FAULT
- OFFLINE
- EXPIRED where applicable to reservations

Important transitions include:

- AVAILABLE → RESERVED
- RESERVED → CHARGING
- CHARGING → AVAILABLE
- AVAILABLE → FAULT
- AVAILABLE → OFFLINE
- RESERVED → EXPIRED
- CHARGING → FAULT
- FAULT → AVAILABLE
- OFFLINE → AVAILABLE

The exact implementation may be refined during development, but state transitions must be explicit and testable.

---

## 8. Core Business Rules

### Compatibility

A vehicle can only be assigned to a compatible charger.

Example:

- CCS vehicle → CCS charger: allowed.
- CCS vehicle → Type 2-only charger: rejected.

### Fault Handling

A charger in FAULT or OFFLINE state must never be allocated.

### Queue

If no compatible charger is available, the vehicle enters the queue.

When a charger becomes available, the system selects the next eligible vehicle rather than blindly selecting the first queue item.

### Queue Fairness

The system should preserve fairness while respecting charger compatibility.

Example:

Queue:

- EV-01 → CCS
- EV-02 → Type 2
- EV-03 → CCS

If a Type 2 charger becomes available, EV-02 should be eligible even though EV-01 is earlier in the global queue.

The precise fairness policy must be documented and consistently tested.

### Double Allocation

A charger must never be allocated to two vehicles simultaneously.

### Reservation Expiry

If a reservation expires before the vehicle arrives, the charger becomes available and the allocation process continues.

### Active Sessions

A vehicle should not have multiple active charging sessions.

### Fault During Charging

If a charger fails during an active session, the affected session becomes interrupted and the vehicle enters the defined recovery/reallocation process.

---

## 9. Real-Time Requirement

The application should update charger and queue state without requiring a page refresh.

A WebSocket-based or equivalent real-time mechanism can broadcast events such as:

- Charger became available.
- Charger became faulty.
- Vehicle entered queue.
- Vehicle was allocated.
- Charging session started.
- Charging session completed.
- Charging session interrupted.

A charger simulator/admin control can be used to trigger these events without requiring physical EV hardware.

---

## 10. Suggested Architecture

A simple modular application is preferred over unnecessary microservices.

Suggested structure:

Browser
→ React Frontend
→ REST + WebSocket
→ Node.js Backend
→ Allocation Engine / Queue Manager / Charging Session Services
→ Database

Suggested backend modules:

- allocation
- charger
- vehicle
- charging
- auth
- realtime

Do not introduce Kubernetes, Kafka, Redis, or other infrastructure unless a real requirement emerges. The assessment rewards a working system and asks the candidate to avoid shallow scope.

---

## 11. Suggested Technology Stack

A practical implementation can use:

- React
- TypeScript
- Vite
- Node.js
- Express
- WebSocket or Socket.IO
- PostgreSQL
- Prisma
- Vitest
- Playwright
- JWT authentication
- Docker Compose
- GitHub Actions

The assessment allows other technology choices. This is a suggested implementation, not a requirement from Tactive.

---

## 12. Test Strategy

### Unit Tests

Focus heavily on:

- Allocation logic
- Charger selection
- Queue selection
- Compatibility
- State transitions

### API Tests

Test:

- Request validation
- Authorization
- Charger state changes
- Session lifecycle
- Queue operations

### End-to-End Tests

Use Playwright to verify:

- Request charging
- Queue behavior
- Allocation
- Session lifecycle
- Real-time UI updates
- Fault handling

---

## 13. Important Test Scenarios

### Happy Path

Create vehicle → request charger → compatible charger available → allocation → charging → completion → charger available.

### No Compatible Charger

Vehicle requests CCS → only Type 2 chargers available → vehicle enters queue.

### Faulty Charger

Compatible charger is FAULT → system must choose another compatible charger.

### Queue Allocation

All chargers occupied → vehicle enters queue → charger becomes available → next eligible vehicle receives allocation.

### Compatibility-Aware Queue

Queue contains different connector types → newly available charger goes to the first eligible vehicle according to the documented fairness policy.

### Double Allocation

Two simultaneous requests target one charger → only one succeeds; the other is queued/rejected according to policy.

### Reservation Expiry

Reservation expires → charger becomes available → next eligible vehicle can receive it.

### Active Session Protection

Vehicle with an active session attempts another allocation → request rejected.

### Charger Failure During Charging

Active charger fails → session becomes INTERRUPTED → recovery/reallocation policy executes.

### Authorization

Driver attempts an operator-only charger management operation → request rejected.

---

## 14. Deliberate Red Run

The assessment explicitly requires a deliberate failure demonstration.

Example:

Temporarily remove or bypass the compatibility condition in the allocation logic.

Run the tests.

Expected result:

- Compatibility test fails.
- The red output is captured.
- The defect is identified.
- The original logic is restored.
- Tests return to green.

Do not fabricate the result. Capture actual output.

---

## 15. Stage 3 AI Change Request

Recommended feature request:

> Add automatic charger reassignment when a charger fails during an active charging session. The system should identify the affected vehicle, find the best compatible available charger, move the vehicle to the new charger when possible, otherwise place the vehicle at the front of the appropriate queue while preserving the existing queue fairness and allocation rules.

This feature should force changes across relevant business logic while preserving the original behavior.

The AI workflow should be captured as:

`Feature request → AI implementation → existing tests → failures → diagnosis → correction → tests → final pass`

If the AI succeeds immediately, document that honestly. If it fails multiple times, document those attempts.

---

## 16. Evidence Structure

Recommended repository structure:

```text
tactive-assessment/
├── app/
│   ├── frontend/
│   └── backend/
├── tests/
│   ├── unit/
│   ├── api/
│   └── e2e/
├── evidence/
│   ├── stage-2/
│   │   ├── green-run.txt
│   │   ├── red-run.txt
│   │   └── screenshots/
│   └── stage-3/
│       ├── prompt.md
│       ├── iteration-1.md
│       ├── iteration-2.md
│       ├── failures/
│       └── final-result.txt
├── docs/
│   ├── architecture.md
│   ├── design.md
│   └── user-guide.md
├── presentation/
├── video/
└── README.md
```

---

## 17. Demo Plan

The five-minute video should follow the assessment structure.

### First 2 minutes

- Problem
- Why EV charger allocation is difficult
- System approach
- Architecture
- Core allocation logic

### Last 3 minutes

- Show live charger dashboard.
- Create a charging request.
- Show allocation.
- Show queue.
- Complete a charging session.
- Trigger a charger fault.
- Show real-time state change.
- Show reassignment/queue behavior.
- Briefly show test results and AI change-loop evidence.

---

## 18. Ground Rules

The assessment allows and expects AI tools.

Every AI tool actually used must be named along with what it was used for.

Do not claim AI actions, test results, or tools that were not actually used.

The final application must run from the repository.

The candidate must be able to explain the architecture and design decisions.

The submission is individual work.

No money should be spent; the assessment says free tiers are sufficient.

---

## 19. Scope Control

### Build

- Charger management
- Vehicle/request management
- Allocation engine
- Queue
- Charging session lifecycle
- Fault handling
- Authentication/authorization
- Real-time updates
- Automated tests
- Test evidence
- AI change-loop evidence
- Documentation
- Demo

### Do Not Build

- Payment gateway
- Maps
- Navigation
- Electricity billing
- Mobile applications
- Advanced analytics
- Real physical charger integration
- ML-based charging prediction
- Full commercial EV platform

The goal is a strong, testable engineering core rather than a large product.

---

## 20. Final Project Statement

**EVChargeFlow is a real-time EV charger allocation and queue management system focused on safely assigning limited compatible chargers to vehicles while maintaining queue fairness, handling charger state changes and failures, preventing conflicting allocations, and synchronizing system state across connected clients.**

The project is designed specifically to demonstrate the assessment's central engineering loop:

**Build → Test → Deliberately Break → Detect → AI Change → Regression Detection → AI Fix → Verify → Document.**
