import { Component } from 'react'
import i18n from '../lib/i18n'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 mx-auto mb-6 rounded-lg bg-danger-50 flex items-center justify-center">
              <svg className="w-10 h-10 text-danger-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">{i18n.t('errorBoundary.title')}</h2>
            <p className="text-slate-500 mb-2">{i18n.t('errorBoundary.description')}</p>
            {this.state.error && (
              <p className="text-xs text-slate-400 mb-6 font-mono bg-slate-100 p-3 rounded-lg text-right">
                {this.state.error.message}
              </p>
            )}
            <button
              onClick={() => { this.setState({ hasError: false, error: null }); window.location.href = '/login' }}
              className="inline-flex items-center px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors font-medium"
            >
              {i18n.t('errorBoundary.goHome')}
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
