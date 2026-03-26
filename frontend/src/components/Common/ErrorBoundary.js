import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('React Error Boundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <Paper 
          sx={{ 
            p: 3, 
            m: 2, 
            border: '2px solid #ff1744',
            backgroundColor: '#ffebee'
          }}
        >
          <Typography variant="h6" color="error" gutterBottom>
            Something went wrong
          </Typography>
          <Box component="pre" sx={{ 
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            color: '#d32f2f',
            fontSize: '0.875rem'
          }}>
            {this.state.error && (
              <div>
                <strong>Error:</strong> {this.state.error?.toString()}
              </div>
            )}
            {this.state.errorInfo && (
              <div>
                <strong>Stack:</strong>
                <pre style={{ whiteSpace: 'pre-wrap' }}>{this.state.errorInfo.componentStack}</pre>
              </div>
            )}
            {/* show any enumerable fields to help debug import objects */}
            {this.state.error && typeof this.state.error === 'object' && (
              <div>
                <strong>Error object keys:</strong>
                <pre>{JSON.stringify(Object.getOwnPropertyNames(this.state.error), null, 2)}</pre>
              </div>
            )}
          </Box>
        </Paper>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
