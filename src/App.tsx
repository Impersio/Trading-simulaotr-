/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Dashboard } from './components/Dashboard';
import { AuthProvider } from './contexts/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Dashboard />
      </AuthProvider>
    </ErrorBoundary>
  );
}
