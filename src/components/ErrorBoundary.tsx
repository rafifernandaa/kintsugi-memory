import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Kintsugi Uncaught Error Boundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[360px] p-8 rounded-3xl bg-[#FFFFFF] border border-[#F2C0B8] shadow-sm flex flex-col items-center justify-center text-center space-y-4 max-w-2xl mx-auto my-8">
          <div className="w-12 h-12 rounded-2xl bg-[#FDF2F0] border border-[#F2C0B8] flex items-center justify-center text-[#993B2B]">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-serif font-bold text-[#2B2827]">
              {this.props.fallbackTitle || 'Synaptic Neural Drift Recovered'}
            </h3>
            <p className="text-xs text-[#5A5553] max-w-md leading-relaxed">
              A temporary rendering variance was caught safely by Kintsugi Error Boundary. No data was lost.
            </p>
          </div>

          {this.state.error && (
            <div className="p-3 bg-[#FAF8F2] border border-[#DDD7C8] rounded-xl text-left max-w-lg w-full overflow-x-auto">
              <span className="text-[10px] font-mono text-[#993B2B] block">
                {this.state.error.message || String(this.state.error)}
              </span>
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={this.handleReset}
              className="px-4 py-2 rounded-xl bg-[#152659] hover:bg-[#1E357A] text-[#FFFFFF] font-mono text-xs font-bold transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restore View</span>
            </button>
            <button
              onClick={() => {
                this.handleReset();
                window.location.reload();
              }}
              className="px-4 py-2 rounded-xl bg-[#FAF8F2] hover:bg-[#EAE6D6] text-[#5A5553] hover:text-[#2B2827] border border-[#DDD7C8] font-mono text-xs font-medium transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Full Reload</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
