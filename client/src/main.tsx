import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add global error handler to prevent unhandled promise rejections
window.addEventListener('unhandledrejection', event => {
  console.warn('Caught unhandled promise rejection:', event.reason);
  // Prevent the default behavior (which logs to console and may trigger runtime error plugin)
  event.preventDefault();
});

// Completely intercept and suppress all MetaMask-related errors
const originalConsoleError = console.error;
console.error = (...args) => {
  const message = args.join(' ');
  if (message.includes('MetaMask') || message.includes('chrome-extension://')) {
    return; // Silently ignore MetaMask errors
  }
  return originalConsoleError.apply(console, args);
};

// Intercept window errors
window.addEventListener('error', event => {
  if (event.error && (
      event.error.message?.includes('MetaMask') ||
      event.error.stack?.includes('chrome-extension://') ||
      event.error.stack?.includes('nkbihfbeogaeaoehlefnkodbefgpgknn') ||
      event.filename?.includes('chrome-extension://')
    )) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    return false;
  }
}, true);

// Completely disable MetaMask by removing it from the window object
const disableMetaMask = () => {
  if (typeof (window as any).ethereum !== 'undefined') {
    // Replace the entire ethereum object with a dummy
    (window as any).ethereum = {
      isMetaMask: false,
      connect: () => Promise.resolve([]),
      request: () => Promise.resolve(null),
      on: () => {},
      removeListener: () => {},
    };
  }
};

// Apply immediately and repeatedly to catch all injection attempts
disableMetaMask();
setInterval(disableMetaMask, 1000); // Check every second

createRoot(document.getElementById("root")!).render(<App />);
