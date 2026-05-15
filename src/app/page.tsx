import Link from "next/link";
import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/Button";

const features = [
  {
    title: "Reference knowledge",
    description:
      "Add plain-text notes beside your draft. Inkwell keeps them as context while you write.",
  },
  {
    title: "AI co-writing",
    description:
      "Chat with an assistant that can draft and edit your document using your sources.",
  },
  {
    title: "Autosave",
    description:
      "Every change is saved automatically so you can focus on the words, not the files.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-full flex-col">
      <AppHeader />
      <main className="flex flex-1 flex-col">
        <section className="mx-auto max-w-3xl px-6 py-24 text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-ink-muted">
            Thoughtful writing
          </p>
          <h1 className="font-serif text-5xl font-semibold leading-tight text-ink md:text-6xl">
            Write with your sources beside you
          </h1>
          <p className="mx-auto mt-6 max-w-xl font-serif text-lg leading-relaxed text-ink-muted">
            Inkwell is a calm document editor where reference knowledge and AI
            help you draft with clarity—grounded in what you already know.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/auth">
              <Button className="px-8 py-3 text-base">Get started</Button>
            </Link>
            <Link href="/auth">
              <Button variant="secondary" className="px-8 py-3 text-base">
                Sign in
              </Button>
            </Link>
          </div>
        </section>

        <section className="border-t border-border bg-surface py-20">
          <div className="mx-auto grid max-w-5xl gap-8 px-6 md:grid-cols-3">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="rounded-xl border border-border bg-paper p-6 shadow-md"
              >
                <h2 className="font-serif text-xl font-semibold text-ink">
                  {feature.title}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-2xl px-6 py-20 text-center">
          <h2 className="font-serif text-3xl font-semibold text-ink">
            Ready to write?
          </h2>
          <p className="mt-4 text-ink-muted">
            Create a free account and start your first document in seconds.
          </p>
          <Link href="/auth" className="mt-8 inline-block">
            <Button className="px-8 py-3 text-base">Create account</Button>
          </Link>
        </section>
      </main>
    </div>
  );
}
