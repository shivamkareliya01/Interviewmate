import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthForm } from "@/components/AuthForm";

export const Route = createFileRoute("/sign-in")({
  head: () => ({
    meta: [
      { title: "Sign in | InterviewMate" },
      {
        name: "description",
        content: "Sign in to InterviewMate to continue your AI-powered technical interview practice.",
      },
      { property: "og:title", content: "Sign in | InterviewMate" },
      {
        property: "og:description",
        content: "Sign in to InterviewMate to continue your AI-powered technical interview practice.",
      },
    ],
  }),
  component: SignInPage,
});

function SignInPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-background px-4 py-16">
      <Link to="/" className="text-lg font-semibold tracking-tight">
        Interview<span className="text-primary">Mate</span>
      </Link>
      <AuthForm mode="sign-in" />
    </main>
  );
}
