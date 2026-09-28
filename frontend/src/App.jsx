import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { AppRoutes } from './routes/AppRoutes.jsx';
import { ErrorBoundary } from './components/ErrorBoundary.jsx';

/**
 * Root Application Component with Global ErrorBoundary, AuthProvider and BrowserRouter
 */
export function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
