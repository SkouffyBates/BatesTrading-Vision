import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // you could log to an external service here
    console.error('Uncaught error in component tree', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-screen bg-slate-900 text-center p-6">
          <div className="max-w-xl">
            <h2 className="text-2xl font-bold text-white mb-4">Oups — une erreur est survenue</h2>
            <p className="text-slate-400 mb-6">L'application a rencontré une erreur. Vous pouvez recharger pour tenter de repartir proprement.</p>
            <div className="flex justify-center gap-4">
              <button onClick={() => window.location.reload()} className="px-4 py-2 bg-emerald-600 rounded text-white">Recharger</button>
              <button onClick={() => { console.clear(); this.setState({ hasError: false, error: null }); }} className="px-4 py-2 bg-slate-700 rounded text-slate-200">Effacer</button>
            </div>
            <pre className="mt-6 text-xs text-slate-500 text-left overflow-auto max-h-40 p-3 bg-slate-800 rounded">{String(this.state.error && this.state.error.stack)}</pre>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
