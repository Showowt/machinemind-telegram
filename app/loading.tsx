export default function Loading() {
  return (
    <main className="min-h-screen bg-[#0f0f1a] text-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-[#d4af37] border-t-transparent animate-spin mx-auto mb-4" />
        <p className="text-[#d4af37]">Loading...</p>
      </div>
    </main>
  );
}
