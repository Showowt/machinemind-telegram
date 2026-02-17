export default function Home() {
  return (
    <main className="min-h-screen bg-[#0f0f1a] text-white flex items-center justify-center p-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">🤖 MachineMind Telegram Bot</h1>
        <p className="text-gray-400 mb-8">Command center is active.</p>
        <div className="bg-[#1a1a2e] p-6 rounded-lg max-w-md mx-auto text-left">
          <h2 className="text-xl font-semibold mb-4 text-[#d4af37]">
            Commands
          </h2>
          <ul className="space-y-2 text-sm font-mono">
            <li>
              <code>/sites</code> — List all projects
            </li>
            <li>
              <code>/status [project]</code> — Deployment status
            </li>
            <li>
              <code>/deploy [project]</code> — Trigger deployment
            </li>
            <li>
              <code>/logs [project]</code> — Recent build logs
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}
