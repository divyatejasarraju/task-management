// Import jest-dom for extended DOM element assertions
import '@testing-library/jest-dom';

// Mock fetch
import 'jest-fetch-mock';

// Mock localStorage
import 'jest-localstorage-mock';

// Silence React 18 console warnings during tests
const originalConsoleError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Warning: ReactDOM.render is no longer supported') ||
      args[0].includes('Warning: React.createFactory'))
  ) {
    return;
  }
  originalConsoleError(...args);
};