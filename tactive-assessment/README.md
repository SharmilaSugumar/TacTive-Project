# EVChargeFlow

**AI-Powered QA Automation, Documentation & Software Engineering Assessment**

EVChargeFlow is a real-time EV charger allocation and queue management system. It dynamically assigns compatible chargers to vehicles while maintaining queue fairness and handling failures.

## Quick Start

### 1. Requirements
- Node.js (v18+)
- npm

### 2. Setup Backend
```bash
cd app/backend
npm install
npx prisma generate
npx prisma db push
npm run dev
```

### 3. Setup Frontend
```bash
cd app/frontend
npm install
npm run dev
```

## Running Tests

### Unit Tests
The core allocation engine logic is heavily tested via Vitest.
```bash
cd app/backend
npm test
```

### End-to-End Tests
E2E testing is built with Playwright to verify full lifecycle workflows.
```bash
cd tests/e2e
npm install
npx playwright test
```

## Assessment Artifacts
- **Architecture & Design**: Located in `/docs`
- **Test Evidence**: Located in `/evidence/stage-2` and `/evidence/stage-3`
- **Video/Presentation**: Refer to `/presentation` and `/video`

## Features
- Real-time WebSocket updates
- Fair Queue Allocation algorithm
- Automatic fault detection and reallocation (Stage 3 Feature)

## AI Tools Used
Per the assessment ground rules, here is the list of AI tools used to develop this project:
- **Google Antigravity / Gemini Agent**: Used as the primary coding agent to architect the solution, write the React and Express code, generate Vitest and Playwright tests, execute the tests to capture evidence, and generate the markdown documentation.
- **ChatGPT / Claude (if applicable)**: Used for initial brainstorming and generating the `Instructions.md` scenario blueprint.
