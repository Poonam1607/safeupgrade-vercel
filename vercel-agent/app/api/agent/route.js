"use client";

import { useState } from "react";

export default function Home() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function runAgent() {
    setLoading(true);

    const res = await fetch("/api/agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dependencies: [
          { name: "next", current: "14.2.0", latest: "15.5.9" },
          { name: "axios", current: "1.6.0", latest: "1.6.5" }
        ]
      })
    });

    const data = await res.json();
    setResult(data);
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-zinc-50 p-10 font-sans">
      <h1 className="text-3xl font-bold mb-4">
        🛡️ SafeUpgrade AI Agent
      </h1>

      <p className="mb-6 text-zinc-700">
        This AI agent analyzes dependency upgrades and blocks risky changes
        like major or canary versions.
      </p>

      <button
        onClick={runAgent}
        disabled={loading}
        className="rounded bg-black px-6 py-3 text-white hover:bg-zinc-800"
      >
        {loading ? "Running Agent..." : "Run AI Agent"}
      </button>

      {result && (
        <pre className="mt-6 rounded bg-white p-4 text-sm shadow">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </main>
  );
}