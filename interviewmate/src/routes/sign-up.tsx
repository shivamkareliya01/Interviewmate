import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthForm } from "@/components/AuthForm";

export const Route = createFileRoute("/sign-up")({
  head: () => ({
    meta: [
      { title: "Create account | InterviewMate" },
      {
        name: "description",
        content: "Create a free InterviewMate account and practice AI-generated technical interviews.",
      },
      { property: "og:title", content: "Create account | InterviewMate" },
      {
        property: "og:description",
        content: "Create a free InterviewMate account and practice AI-generated technical interviews.",
      },
    ],
  }),
  component: SignUpPage,
});

function SignUpPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-background px-4 py-16">
      <Link to="/" className="flex items-center gap-2">
        <img src="/logo.jpg" alt="InterviewMate Logo" className="h-8 w-auto rounded-md" />
        <span className="text-lg font-semibold tracking-tight">
          Interview<span className="text-primary">Mate</span>
        </span>
      </Link>
      <AuthForm mode="sign-up" />
    </main>
  );
}
