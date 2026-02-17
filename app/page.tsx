export default function Home() {
  return (
    <main className="min-h-screen bg-[#0f0f1a] text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">
          🤖 MachineMind Command Center
        </h1>
        <p className="text-gray-400 mb-8">
          Telegram bot for deployment control
        </p>

        <div className="space-y-6">
          <section className="bg-[#1a1a2e] p-6">
            <h2 className="text-xl font-semibold mb-4 text-[#d4af37]">
              Deployment Commands
            </h2>
            <ul className="space-y-2 text-sm font-mono">
              <li>
                <code>/sites</code> — List all projects
              </li>
              <li>
                <code>/status [project]</code> — Deployment status
              </li>
              <li>
                <code>/deploy [project]</code> — Deploy to production
              </li>
              <li>
                <code>/logs [project]</code> — Build logs
              </li>
              <li>
                <code>/errors [project]</code> — Runtime errors
              </li>
              <li>
                <code>/cancel [project]</code> — Cancel active build
              </li>
            </ul>
          </section>

          <section className="bg-[#1a1a2e] p-6">
            <h2 className="text-xl font-semibold mb-4 text-[#d4af37]">
              Project Info
            </h2>
            <ul className="space-y-2 text-sm font-mono">
              <li>
                <code>/domains [project]</code> — List domains
              </li>
              <li>
                <code>/env [project]</code> — Environment variables
              </li>
              <li>
                <code>/rollback [project]</code> — Rollback to previous
              </li>
            </ul>
          </section>

          <section className="bg-[#1a1a2e] p-6">
            <h2 className="text-xl font-semibold mb-4 text-[#d4af37]">
              Utility
            </h2>
            <ul className="space-y-2 text-sm font-mono">
              <li>
                <code>/ping</code> — Health check
              </li>
              <li>
                <code>/help</code> — Show all commands
              </li>
            </ul>
          </section>
        </div>

        <p className="text-gray-500 text-sm mt-8 text-center">
          MachineMind © 2026 — Secure. Private. Powerful.
        </p>
      </div>
    </main>
  );
}
