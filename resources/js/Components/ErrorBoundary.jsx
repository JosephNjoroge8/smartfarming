import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Component Error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            // Custom error UI
            return (
                <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                    <h2 className="text-lg font-medium text-red-800 mb-2">Component Error</h2>
                    <p className="text-sm text-red-600">
                        Something went wrong in this component.
                        {this.props.componentName && ` (${this.props.componentName})`}
                    </p>
                    {this.props.fallback || 
                        <button 
                            className="mt-3 px-4 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200"
                            onClick={() => window.location.reload()}
                        >
                            Reload Page
                        </button>
                    }
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;