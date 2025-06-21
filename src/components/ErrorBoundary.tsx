import { Component, ErrorInfo, ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo })
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '20px',
          color: 'red',
          backgroundColor: '#ffeeee',
          border: '1px solid red',
          borderRadius: '4px'
        }}>
          <h2>应用渲染出错</h2>
          <p><strong>错误信息:</strong> {this.state.error?.toString()}</p>
          <details style={{ marginTop: '10px' }}>
            <summary>错误堆栈</summary>
            <pre style={{ 
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word',
              backgroundColor: '#fff',
              padding: '10px',
              borderRadius: '4px'
            }}>
              {this.state.errorInfo?.componentStack}
            </pre>
          </details>
        </div>
      )
    }

    return this.props.children
  }
}