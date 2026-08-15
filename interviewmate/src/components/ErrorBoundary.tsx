import React, { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RotateCcw, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ErrorBoundary caught an unhandled error]:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
          <div className="p-8 rounded-3xl bg-slate-900/90 border border-amber-500/30 backdrop-blur-2xl shadow-2xl max-w-md w-full space-y-5">
            <div className="size-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="size-8 animate-pulse" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white tracking-tight">
                Something went wrong loading this question
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                {this.state.error?.message || "An unexpected rendering error occurred."}
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button
                onClick={this.handleReset}
                variant="outline"
                className="flex-1 border-slate-800 text-slate-300 hover:text-white text-xs gap-1.5 py-2.5 rounded-xl"
              >
                <RotateCcw className="size-3.5" /> Try Again
              </Button>
              <Button
                onClick={() => {
                  window.location.href = "/user/dashboard";
                }}
                className="flex-1 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs gap-1.5 py-2.5 rounded-xl"
              >
                <LayoutDashboard className="size-3.5" /> Dashboard
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
