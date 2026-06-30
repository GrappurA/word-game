"use client"

export default function Popup() {
    <div className="fixed top-5 right-5 z-50 bg-gray-700 border-4 border-[#E1CE7A] rounded-2xl p-4 shadow-2xl flex items-center gap-4 transition-all animate-pulse">
        {/* Tailwind Loading Spinner */}
        <svg className="animate-spin h-6 w-6 text-[#E1CE7A]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-xl tracking-wider text-white">Connecting...</p>
    </div>
}