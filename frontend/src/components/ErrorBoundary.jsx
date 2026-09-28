import { Component } from 'react';
import { AlertTriangle, RefreshCw, Home, ChevronDown, ChevronUp, Terminal } from 'lucide-react';

/**
 * Global React Error Boundary for production crash protection and graceful recovery.
 * Catches unhandled runtime exceptions in descendant component trees.
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error details for client observability
    console.error('🚨 [ErrorBoundary] Uncaught application error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  toggleDetails = () => {
    this.setState((prev) => ({ showDetails: !prev.showDetails }));
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, errorInfo, showDetails } = this.state;
      const isDev = import.meta.env?.DEV;

      return (
        <div className="min-h-screen bg-[#0b0f19] text-[#f3f4f6] flex items-center justify-center p-4 selection:bg-[#f84464] selection:text-white">
          <div className="relative w-full max-w-xl bg-gray-900/90 border border-gray-800 rounded-3xl p-8 sm:p-10 shadow-2xl backdrop-blur-xl overflow-hidden text-center">
            {/* Ambient cyber glow background */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#f84464]/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

            {/* Glowing Emergency Icon */}
            <div className="mx-auto w-20 h-20 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-[#f84464] mb-6 shadow-lg shadow-red-500/10">
              <AlertTriangle className="w-10 h-10 animate-pulse" />
            </div>

            {/* Status Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-[#f84464] text-xs font-semibold uppercase tracking-wider mb-4">
              <span className="w-2 h-2 rounded-full bg-[#f84464] animate-ping" />
              Runtime Safeguard Activated
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-3">
              Something went wrong
            </h1>

            <p className="text-gray-400 text-sm sm:text-base leading-relaxed mb-8 max-w-md mx-auto">
              An unexpected error interrupted your session. Our system prevented a total application crash.
            </p>

            {/* Recovery Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#f84464] hover:bg-[#e03a58] text-white font-semibold text-sm shadow-lg shadow-[#f84464]/25 transition-all cursor-pointer active:scale-95"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Page
              </button>

              <button
                type="button"
                onClick={this.handleGoHome}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gray-800 hover:bg-gray-700/80 border border-gray-700 text-gray-200 font-semibold text-sm transition-all cursor-pointer active:scale-95"
              >
                <Home className="w-4 h-4" />
                Go Home
              </button>
            </div>

            {/* Optional Collapsible Technical Details */}
            {(isDev || error) && (
              <div className="border-t border-gray-800/80 pt-4 mt-6 text-left">
                <button
                  type="button"
                  onClick={this.toggleDetails}
                  className="inline-flex items-center justify-between w-full text-xs font-medium text-gray-500 hover:text-gray-300 transition-colors py-1 cursor-pointer"
                >
                  <span className="flex items-center gap-1.5 font-mono">
                    <Terminal className="w-3.5 h-3.5 text-[#f84464]" />
                    {showDetails ? 'Hide Diagnostics' : 'View Diagnostics'}
                  </span>
                  {showDetails ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>

                {showDetails && (
                  <div className="mt-3 p-4 rounded-xl bg-black/60 border border-gray-800 font-mono text-xs text-red-400 overflow-x-auto max-h-48">
                    <p className="font-bold text-red-300 mb-1">{error?.toString()}</p>
                    {errorInfo?.componentStack && (
                      <pre className="text-gray-400 text-[11px] whitespace-pre-wrap leading-tight">
                        {errorInfo.componentStack}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
