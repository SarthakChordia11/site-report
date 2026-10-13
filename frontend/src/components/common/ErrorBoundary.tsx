import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in React component:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleClearStorage = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#08090C] bg-grid text-white flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-[#10131A] border border-white/10 rounded-3xl p-8 text-center space-y-4 shadow-2xl backdrop-blur-xl">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <h2 className="text-xl font-bold text-white tracking-tight">Something went wrong</h2>
            <p className="text-xs text-neutral-400 leading-relaxed">
              {this.state.error?.message || 'An unexpected rendering error occurred.'}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <button
                onClick={this.handleReset}
                className="w-full sm:w-auto px-5 py-3 bg-white hover:bg-neutral-200 text-neutral-950 rounded-full text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-white/10 active:scale-95"
              >
                <RefreshCw className="w-3.5 h-3.5 text-neutral-950" />
                <span>Reload Application</span>
              </button>

              <button
                onClick={this.handleClearStorage}
                className="w-full sm:w-auto px-5 py-3 bg-white/10 hover:bg-white/15 text-white border border-white/15 rounded-full text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Reset & Log In Again</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
