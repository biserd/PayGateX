import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add global error handler to prevent unhandled promise rejections
window.addEventListener('unhandledrejection', event => {
  console.warn('Caught unhandled promise rejection:', event.reason);
  // Prevent the default behavior (which logs to console and may trigger runtime error plugin)
  event.preventDefault();
});

// Immediately disable MetaMask auto-connection attempts
if (typeof (window as any).ethereum !== 'undefined') {
  const ethereum = (window as any).ethereum;
  
  // Override connect method
  if (ethereum.connect) {
    ethereum.connect = () => {
      console.log('MetaMask connection blocked - use Wallet Test page for wallet functionality');
      return Promise.resolve([]);
    };
  }
  
  // Override request method for eth_requestAccounts specifically
  const originalRequest = ethereum.request;
  if (originalRequest) {
    ethereum.request = (args: any) => {
      if (args.method === 'eth_requestAccounts') {
        console.log('MetaMask account request blocked - use Wallet Test page');
        return Promise.resolve([]);
      }
      return originalRequest.call(ethereum, args);
    };
  }
}

createRoot(document.getElementById("root")!).render(<App />);
