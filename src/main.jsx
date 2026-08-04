import { StrictMode } from "react"

globalThis.global = globalThis

import { HelmetProvider } from "react-helmet-async"

import { createRoot } from "react-dom/client"
import "./index.css"
import App from "./App.jsx"
import { CustomerAuthProvider } from "./context/CustomerAuthContext"

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <HelmetProvider>
      <CustomerAuthProvider>
        <App />
      </CustomerAuthProvider>
    </HelmetProvider>
  </StrictMode>
)