import React from 'react';
import LoadingSpinner from './LoadingSpinner';

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
      return <LoadingSpinner fullScreen={true} />;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
