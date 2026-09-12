import Link from "next/link";

import { signOut } from "@/app/dashboard/actions";

export function LearnerNav() {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4">
      <Link className="text-xl font-black tracking-tight" href="/dashboard">TOEIC Practice</Link>
      <nav className="flex flex-wrap items-center gap-2 text-sm font-semibold" aria-label="Main navigation">
        <Link className="rounded-lg px-3 py-2 hover:bg-white" href="/dashboard">Dashboard</Link>
        <Link className="rounded-lg px-3 py-2 hover:bg-white" href="/progress">Progress</Link>
        <Link className="rounded-lg bg-teal-700 px-3 py-2 text-white hover:bg-teal-800" href="/practice/part-5">Start practice</Link>
        <form action={signOut}>
          <button className="rounded-lg px-3 py-2 text-slate-600 hover:bg-white" type="submit">Sign out</button>
        </form>
      </nav>
    </header>
  );
}
