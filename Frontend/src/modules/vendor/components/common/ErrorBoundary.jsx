import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Vendor App Error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="flex flex-col items-center gap-6 p-8 max-w-sm mx-auto bg-white rounded-[32px] shadow-2xl border border-gray-100">
            <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center">
              <span className="text-5xl">⚡</span>
            </div>
            
            <div className="text-center">
              <h2 className="text-2xl font-black text-gray-900 mb-2">Something went wrong</h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                The vendor app encountered an unexpected error. Don't worry, your data is safe.
              </p>
            </div>

            <div className="w-full space-y-3">
              <button
                onClick={() => {
                  window.location.reload();
                }}
                className="w-full py-4 rounded-2xl font-bold text-white transition-all active:scale-95 flex items-center justify-center gap-2"
                style={{
                  background: '#00a6a6',
                  boxShadow: '0 8px 20px rgba(0, 166, 166, 0.25)',
                }}
              >
                Refresh App
              </button>
              
              <button
                onClick={() => {
                  window.location.href = '/vendor/dashboard';
                }}
                className="w-full py-3 rounded-2xl font-bold text-gray-400 text-sm hover:text-gray-600 transition-colors"
              >
                Go to Dashboard
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 p-4 bg-red-50 rounded-2xl w-full overflow-hidden">
                <summary className="cursor-pointer font-bold text-xs text-red-800 mb-2 uppercase tracking-widest">Debug Info</summary>
                <pre className="text-[10px] text-red-700 whitespace-pre-wrap font-mono opacity-70">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
