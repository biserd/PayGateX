import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add global error handler to prevent unhandled promise rejections
window.addEventListener('unhandledrejection', event => {
  console.warn('Caught unhandled promise rejection:', event.reason);
  // Prevent the default behavior (which logs to console and may trigger runtime error plugin)
  event.preventDefault();
});

createRoot(document.getElementById("root")!).render(<App />);
