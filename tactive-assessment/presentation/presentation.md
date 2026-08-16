# Presentation: EVChargeFlow CI/CD Pipeline Resolution

This document contains a detailed slide-by-slide outline for your PowerPoint presentation.

---

## Slide 1: Title Slide
**Title:** EVChargeFlow: Overcoming CI/CD Pipeline Failures with AI
**Subtitle:** A deep dive into modern tech stack conflicts, debugging GitHub Actions, and AI-assisted resolution.
**Speaker:** [Your Name / Team Name]

---

## Slide 2: The Application
**Title:** What is EVChargeFlow?
**Bullet Points:**
* A robust, real-time allocation engine designed to manage Electric Vehicle (EV) charging stations.
* **Core Logic:** Handles vehicle queuing, charger matching, and active session protection.
* **Fault Tolerance:** Features built-in logic to gracefully handle charger hardware faults and dynamically re-queue or reallocate vehicles.
* **Objective:** Deliver a seamless charging experience with zero downtime and strict code quality enforcement.

---

## Slide 3: The Tech Stack
**Title:** Modern Tools for a Modern App
**Bullet Points:**
* **Frontend:** React 19, Vite 8, TypeScript, TailwindCSS
* **Backend:** Node.js, Express, Prisma ORM, TypeScript
* **Testing:** Vitest 4 (with v8 strict coverage engine)
* **DevOps / CI/CD:** GitHub Actions (Automated PR checks and builds)

---

## Slide 4: The Problem
**Title:** The CI/CD Roadblock
**Content:**
Despite the application running and testing perfectly on local development machines, the GitHub Actions Pull Request pipeline was completely failing. 
**Symptoms:**
* **Frontend Build Failure:** The pipeline crashed instantly during dependency installation and build steps.
* **Backend Test Failure:** The backend verification step stalled and failed to complete.
* **Result:** Developers were blocked from merging code, halting the deployment lifecycle despite local tests showing 100% code coverage.

---

## Slide 5: Why It Failed (Part 1: The Frontend)
**Title:** Dependency Conflicts & Compiler Craters
**Bullet Points:**
* **The React 19 Conflict:** The frontend was utilizing the newly released React 19. However, the UI icon library (`lucide-react`) strictly requested React 18 in its peer dependencies. This caused GitHub Actions' strict `npm install` to abort immediately with an `ERESOLVE` error.
* **The Ghost Config:** The CI pipeline was instructed to run `tsc && vite build`. Because a `tsconfig.json` was missing in the frontend directory, the TypeScript compiler (`tsc`) printed its help menu and exited with an error code, instantly failing the build process.

---

## Slide 6: Why It Failed (Part 2: The Backend & Environment)
**Title:** Hanging Tests & End-of-Life Environments
**Bullet Points:**
* **Vitest Watch Mode:** The backend `package.json` was configured to run tests using the default `vitest` command. In local environments, this opens an interactive watch mode. In the CI runner, it caused the pipeline to hang indefinitely expecting user input.
* **The Silent Killer (Node 18):** The GitHub Actions `ci.yml` workflow was configured to use Node.js version 18. Because Vite 8 and Vitest 4 are modern 2026 tools, they dropped support for Node 18 (which reached End of Life in 2025). This caused instant "Unsupported Engine" crashes on the Ubuntu servers.

---

## Slide 7: How We Used AI to Correct It
**Title:** AI-Assisted Debugging and Resolution
**Content:**
By pairing with an AI Coding Assistant, we bypassed traditional blind-guessing and resolved the pipeline systematically:
1. **Local Simulation:** The AI executed CI commands locally inside the terminal to accurately reproduce the hidden `ERESOLVE` and `tsc` crashes.
2. **Automated Code Fixes:** 
   * Updated `ci.yml` to use `npm install --legacy-peer-deps` to bypass the React 19 strict conflict.
   * Rewrote the frontend build script to directly use `vite build`, circumventing the missing TypeScript config.
   * Modified the backend test script to `vitest run`, forcing a strict, non-hanging execution.
3. **Environment Upgrade:** The AI analyzed the ecosystem tool versions (Vite 8) and autonomously upgraded the workflow's Node.js environment from v18 to v20.
4. **API Interrogation:** When the GitHub CLI lacked authentication on the local machine, the AI utilized the GitHub REST API via PowerShell to query the live Pull Request status and verify that the pipeline finally succeeded.

---

## Slide 8: Conclusion
**Title:** Lessons Learned
**Bullet Points:**
* **Environment Parity is Critical:** What works on a local Windows machine may fail on a Linux CI runner if tool versions and environment variables don't match.
* **Dependency Bleeding Edge:** Upgrading to major versions (like React 19 and Vite 8) requires careful auditing of third-party peer dependencies.
* **AI as a DevOps Partner:** AI agents can rapidly diagnose cross-platform CI/CD issues by reading package files, mimicking cloud execution, and directly editing pipeline configurations.

---

## Slide 9: Q&A
**Title:** Questions & Answers
**Content:** 
*Thank you!*
