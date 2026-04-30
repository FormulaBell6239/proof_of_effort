import * as React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-950 text-white">
          <div className="max-w-md rounded-lg border border-red-700 bg-gray-900 p-8 text-center">
            <h1 className="mb-2 text-xl font-semibold text-red-400">Something went wrong</h1>
            <p className="mb-4 text-sm text-gray-400">{this.state.error.message}</p>
            <button
              className="rounded bg-red-700 px-4 py-2 text-sm font-medium hover:bg-red-600"
              onClick={() => this.setState({ error: null })}
            >
              Try again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
