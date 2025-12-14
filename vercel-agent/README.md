# SafeUpgrade Vercel Agent 🤖🌐

SafeUpgrade Vercel Agent is a web-based **AI DevOps Agent** deployed on **Vercel**.  
It exposes SafeUpgrade’s decision-making logic through a **REST API** and a simple **UI**, allowing teams to safely evaluate dependency upgrades without breaking production.

This agent is part of the **“AI Agents Assemble”** track and complements the SafeUpgrade CLI Agent.

---

## 🧠 Why this project exists

In December, a **critical vulnerability** was reported in **Next.js / React Server Components**.  
Many production applications were running vulnerable versions, and blindly upgrading could cause outages.

This agent answers a simple but critical question:

> **“Is it safe to upgrade this dependency right now?”**

---

## 🤖 Why this is an AI Agent (important for hackathon)

The Vercel Agent follows the **AI Agent lifecycle**:

1. **Observe** – Receives dependency metadata (current vs latest)
2. **Reason** – Applies safety rules (major upgrade, canary, framework constraints)
3. **Decide** – Determines whether to upgrade or block
4. **Act** – Returns a structured decision with reasoning

Even without a full external LLM, the agent behaves autonomously and deterministically, making **real DevOps decisions**.

---

## 🏗️ Tech Stack

- **Next.js (App Router)**
- **Vercel Serverless Functions**
- **Node.js**
- **REST API**
- **Rule-based AI decision engine**

---

## 🚀 Deployment

This agent is deployed on **Vercel**.

### Root Directory (important)