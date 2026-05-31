# 🌊 Proov Open-Source Concepts

Welcome to the **ProoV Open-Source Core Library Collection**! This repository open-sources the core engine components and AI evaluation systems that power our virtual work-experience platform at **[projectstudy.in](https://projectstudy.in)**.

Instead of keeping our architecture closed, we have abstracted and open-sourced our two primary foundational engines under the permissive **MIT License** to support the developer, ed-tech, and open-source AI grading ecosystems.

---

## 📁 What's in this Repository?

We have structured this repository into two highly modular, independent, and standalone sub-projects:

### 1. 🌊 [SlideVibe](./slidevibe) (Frontend Interactive Learning Engine)
An immersive, browser-native slide engine designed to host data-science courses and coding challenges completely in-browser. 
* **Core tech**: React 19 + Vite 6 + Tailwind v4 + CodeMirror 6.
* **Key highlight**: Integrates **Pyodide** (CPython compiled to WebAssembly) running inside isolated background Web Worker threads to allow students to run full Pandas routines and render Matplotlib charts natively in their browser—with **0% server-side dependencies**.
* **AI Feature**: Built-in floating **AI Coach overlay** and cinematic opening sequence frameworks.

### 2. 🤖 [EvaluatorCore](./evaluator-core) (Backend Event-Driven AI Grader)
A framework-agnostic, production-grade AI grading library designed to score student or developer submissions against complex, versioned, multi-weighted JSON rubrics.
* **Core tech**: Node.js + TypeScript + Zod.
* **Key highlight**: Enforces strict, type-safe system prompt outputs using **Zod schema validations** with automatic exponential retries. Includes a fully **deterministic Scoring Engine** that aggregates scores, flags plagiarism/integrity threats, and manages Human-in-the-Loop review routing.
* **Framework integration**: Connects easily with Express, Fastify, NestJS, or serverless Lambda architectures.

---

## 🛠 Developer Quickstart

Each sub-directory contains its own comprehensive setup instructions and detailed architectural design specifications.

- To run the **Browser Python Slide Sandbox**, navigate to `/slidevibe`, run `npm install` and `npm run dev`.
- To run the **Structured AI Grading Simulation CLI**, navigate to `/evaluator-core`, run `npm install` and `npm run demo`.

---

## 📜 License
All libraries in this repository are licensed under the **[MIT License](LICENSE)**.

---

## 🌎 Enterprise Platform & Support
The full-featured Proov virtual experience suite—featuring student dashboard portals, company partner portals, multi-agent AI verification pipelines, and verified digital certificate generators—is live in production at **[projectstudy.in](https://projectstudy.in)**.
