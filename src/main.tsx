import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

try {
  createRoot(document.getElementById("root")!).render(<App />);
} catch (err) {
  const msg = err instanceof Error ? err.message : String(err);
  document.getElementById("root")!.innerHTML =
    `<div style="font-family:monospace;padding:2rem;color:#c00;background:#fff;min-height:100vh">` +
    `<h2 style="margin:0 0 1rem">App failed to start</h2>` +
    `<pre style="white-space:pre-wrap;word-break:break-word">${msg}</pre>` +
    `</div>`;
  console.error("[startup error]", err);
}
