# RDM Agent: Project Overview

## 🎯 Goal
RDM Agent (Relational Database Management Agent) is an AI-powered web application built to simplify database design and management. It serves as a comprehensive toolset for developers to generate schemas, write and debug SQL queries, and seed databases—all through natural language interactions. A standout feature of the project is its full bilingual support, providing explanations in both **Nepali** and **English**.

## 🚀 Core Features
1. **Schema Designer & ERD Visualizer**: Users can describe their app in plain text (e.g., "I need a library management system"). The agent generates the full database schema (tables, columns, types, keys) and visualizes it interactively using an Entity-Relationship Diagram (ERD).
2. **SQL Query Generator**: Translates plain language requirements into precise SQL queries.
3. **SQL Debugger**: Analyzes broken SQL queries, identifies the bugs, and provides fixed queries with detailed explanations.
4. **Dummy Data Generator**: Takes a raw SQL table schema and generates realistic seed data via `INSERT` statements.
5. **Bilingual Explanations**: All AI responses are provided in both Nepali and English to cater to a wider developer audience.
6. **Local History**: Automatically saves a history of all generated schemas, queries, and debug sessions to the browser's `localStorage` for easy reference.
7. **Quality of Life**: Features seamless one-click copy buttons for all generated SQL and an integrated Groq API Key management panel.

## 🛠️ Tech Stack
- **Framework**: React + Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 (Dark mode, glassmorphism UI)
- **Icons**: Lucide React
- **State Management**: Zustand (Persisted in `localStorage`)
- **AI Integration**: Groq API (`llama-3.3-70b-versatile` model) using `@groq/groq-sdk`
- **Diagramming**: React Flow (`@xyflow/react`) for interactive ERD visualization
- **Markdown Rendering**: `react-markdown` + `react-syntax-highlighter`

## 📁 Architecture Summary
- `src/components/Layout.tsx`: Handles the primary UI structure, including the sidebar navigation and history slide-out panel.
- `src/store/useStore.ts`: Zustand store managing the active tool, saved history, and the user's Groq API key securely.
- `src/services/groqService.ts`: Centralized service managing API calls to Groq. Contains engineered prompts that enforce strict JSON/Markdown formatting and bilingual output.
- `src/components/tools/*`: Houses the individual feature components (`SchemaDesigner`, `QueryGenerator`, `SQLDebugger`, `DummyDataGenerator`).
- `src/components/ERDViewer.tsx`: Custom React Flow implementation that parses the LLM-generated JSON into nodes and edges for the diagram.

## 💻 How to Run
1. Navigate to the project directory: `cd rdm-agent`
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. Open the provided `localhost` link in your browser.
5. Enter your Groq API key via the "Settings" modal to start generating!
