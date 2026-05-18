import React from 'react';
import { Alert, Button } from '@mui/material';
import { captureException } from '../../services/telemetry';

class SectionErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    captureException(error, {
      source: this.props.source || 'react.section_error_boundary',
      componentStack: info.componentStack,
    });
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={() => this.setState({ hasError: false })}>
            Retry
          </Button>
        }
      >
        {this.props.message || 'This section could not be displayed.'}
      </Alert>
    );
  }
}

export default SectionErrorBoundary;
