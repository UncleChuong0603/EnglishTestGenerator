"use client";
export default function ErrorPage({ reset }: { error: Error; reset: () => void }) { return <main className="grid min-h-screen place-items-center bg-slate-50 p-6 text-center"><div><h1 className="text-2xl font-black">Admin page unavailable</h1><button className="mt-5 rounded-xl bg-slate-900 px-5 py-3 font-bold text-white" onClick={reset}>Try again</button></div></main>; }
