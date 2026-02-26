import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-3xl space-y-8 text-center">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            Worksphere
          </p>
          <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            Advanced project management for modern product teams.
          </h1>
          <p className="text-balance text-sm text-muted-foreground sm:text-base">
            Plan projects, track tasks, and monitor financials in one unified
            workspace for leaders and members.
          </p>
        </div>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/auth/register"
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            Get started
          </Link>
          <Link
            href="/auth/login"
            className="inline-flex h-10 items-center justify-center rounded-md border px-6 text-sm font-medium text-foreground hover:bg-accent"
          >
            Sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
