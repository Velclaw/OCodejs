const routeCode = `export const maxDuration = 5

export function GET(_request: Request) {
  return new Response('Vercel', {
    status: 200,
  })
}`

export default function Page() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center gap-8 px-6 py-16">
      <header className="flex flex-col gap-3">
        <p className="font-mono text-sm text-muted-foreground">Next.js Route Handler</p>
        <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
          A five-second Vercel response
        </h1>
        <p className="max-w-2xl text-pretty text-lg leading-7 text-muted-foreground">
          This minimal example exports a maximum duration and returns a plain text response from a GET route.
        </p>
      </header>

      <section className="overflow-hidden rounded-xl border bg-card shadow-sm" aria-labelledby="code-heading">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 id="code-heading" className="font-mono text-sm font-medium">
            app/api/vercel/route.ts
          </h2>
          <span className="rounded-full bg-muted px-2.5 py-1 font-mono text-xs text-muted-foreground">
            GET /api/vercel
          </span>
        </div>
        <pre className="overflow-x-auto p-5 text-sm leading-6"><code>{routeCode}</code></pre>
      </section>

      <a
        className="inline-flex w-fit items-center rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        href="/api/vercel"
      >
        Try the route
      </a>

      <div className="grid gap-4 border-t pt-6 text-sm leading-6 text-muted-foreground sm:grid-cols-2">
        <p><strong className="font-medium text-foreground">maxDuration:</strong> limits this function to five seconds.</p>
        <p><strong className="font-medium text-foreground">GET:</strong> returns a 200 response whose body is <code className="font-mono text-foreground">Vercel</code>.</p>
      </div>
    </main>
  )
}
