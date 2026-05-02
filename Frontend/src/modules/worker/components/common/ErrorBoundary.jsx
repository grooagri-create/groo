import React from 'react';
import LogoLoader from '../../../../components/common/LogoLoader';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Worker App Error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      return <LogoLoader />;
    }

    return this.props.children;
  }
}
export default ErrorBoundary;

