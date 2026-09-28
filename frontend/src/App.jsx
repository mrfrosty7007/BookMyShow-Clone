import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { CityProvider } from './context/CityContext.jsx';
import { AppRoutes } from './routes/AppRoutes.jsx';
import { ErrorBoundary } from './components/ErrorBoundary.jsx';

/**
 * Root Application Component with Global ErrorBoundary, AuthProvider, CityProvider and BrowserRouter
 */
export function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <CityProvider>
            <AppRoutes />
          </CityProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
