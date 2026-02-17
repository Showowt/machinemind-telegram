"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <main className="min-h-screen bg-[#0f0f1a] text-white flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-[#d4af37]/10 flex items-center justify-center mx-auto mb-6">
          <span className="text-[#d4af37] text-3xl">!</span>
        </div>
        <h1 className="text-2xl font-bold text-[#d4af37] mb-4">
          Something went wrong
        </h1>
        <p className="text-gray-400 mb-6">
          {error.message || "An unexpected error occurred"}
        </p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-[#d4af37] text-[#0f0f1a] font-semibold hover:bg-[#d4af37]/90 transition"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
