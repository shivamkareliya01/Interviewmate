import { createFileRoute, Link } from "@tanstack/react-router";
import { Brain, Gauge, Trophy, Timer, Bookmark, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import heroImage from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "InterviewMate — AI Technical Interview Practice" },
      {
        name: "description",
        content:
          "Practice technical interviews with AI-generated questions, instant scoring and personalised feedback across React, Node.js, Python, SQL and more.",
      },
      { property: "og:title", content: "InterviewMate — AI Technical Interview Practice" },
      {
        property: "og:description",
        content:
          "AI-generated interview questions, instant scoring and a leaderboard to keep you sharp.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const features = [
  {
    icon: Brain,
    title: "AI-generated questions",
    description: "Five tailored questions for any domain and difficulty, written by an expert interviewer.",
  },
  {
    icon: Gauge,
    title: "Instant scoring",
    description: "Every answer gets a 1–10 rating with concise, actionable feedback.",
  },
  {
    icon: Sparkles,
    title: "Performance summary",
    description: "Strengths, improvements and next steps after each mock interview.",
  },
  {
    icon: Timer,
    title: "Timed mock interviews",
    description: "One question at a time with a countdown, just like the real thing.",
  },
  {
    icon: Trophy,
    title: "Leaderboard",
    description: "Earn points and see how you rank against other candidates.",
  },
  {
    icon: Bookmark,
    title: "Bookmarks & practice mode",
    description: "Browse a self-paced question bank and save the ones worth revisiting.",
  },
];

function Landing() {
  const { session } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <span className="text-lg font-semibold tracking-tight">
          Interview<span className="text-primary">Mate</span>
        </span>
        <nav className="flex items-center gap-2">
          {session ? (
            <Button asChild size="sm">
              <Link to="/user/dashboard">Go to dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/sign-in">Sign in</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/sign-up">Get started</Link>
              </Button>
            </>
          )}
        </nav>
      </header>

      <main>
        <section className="mx-auto grid w-full max-w-6xl items-center gap-12 px-6 pb-20 pt-10 lg:grid-cols-2 lg:pt-20">
          <div>
            <Badge variant="secondary" className="mb-5">
              Powered by AI
            </Badge>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              Ace your next technical interview
            </h1>
            <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
              Pick a domain and difficulty, answer five AI-generated interview questions, and get
              honest scoring plus a personalised performance summary — in minutes.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to={session ? "/user/dashboard" : "/sign-up"}>
                  {session ? "Continue practicing" : "Start practicing free"}
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/sign-in">I already have an account</Link>
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              React · Node.js · Python · SQL · JavaScript · System Design
            </p>
          </div>
          <div className="overflow-hidden rounded-2xl border border-border/60 shadow-2xl">
            <img
              src={heroImage}
              alt="InterviewMate dashboard showing an AI-scored coding interview answer"
              width={1600}
              height={1104}
              className="h-auto w-full"
            />
          </div>
        </section>

        <section className="border-t border-border/60 bg-card/40">
          <div className="mx-auto w-full max-w-6xl px-6 py-20">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Everything you need to practice
            </h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              A focused loop: generate, answer, get scored, improve — then track your progress over time.
            </p>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <Card key={feature.title} className="h-full">
                  <CardHeader>
                    <feature.icon className="mb-2 size-6 text-primary" aria-hidden />
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-4xl px-6 py-20 text-center">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Ready for your next interview?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Create a free account and run your first AI mock interview today.
          </p>
          <Card className="mx-auto mt-8 max-w-md">
            <CardContent className="pt-6">
              <Button asChild size="lg" className="w-full">
                <Link to="/sign-up">Create your free account</Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="border-t border-border/60">
        <div className="mx-auto w-full max-w-6xl px-6 py-8 text-sm text-muted-foreground">
          © {new Date().getFullYear()} InterviewMate. Practice smarter.
        </div>
      </footer>
    </div>
  );
}
