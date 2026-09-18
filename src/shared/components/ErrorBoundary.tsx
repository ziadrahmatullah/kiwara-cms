import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

interface Props {
  children: ReactNode;
}
interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary", error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
        <AlertTriangle className="h-10 w-10 text-destructive" />
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Terjadi kesalahan</h2>
          <p className="text-sm text-muted-foreground max-w-md">{this.state.error.message}</p>
        </div>
        <Button variant="outline" onClick={() => this.setState({ error: null })}>
          Coba lagi
        </Button>
      </div>
    );
  }
}
