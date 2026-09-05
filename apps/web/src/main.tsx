import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";
import "./features/scales/realityVisualGrade.css";

import App from "./App.tsx";

import {
  installContinuousRealityZoom
} from "./features/scales/installContinuousRealityZoom";

installContinuousRealityZoom();

createRoot(
  document.getElementById("root")!
).render(
  <StrictMode>
    <>
      <App />

      <div
        className="vsmos-signature"
        aria-label="VSMOS stands for Void Softwares Cosmos. Developed by Shivam."
      >
        <strong>VSMOS</strong>
        <span>VOID SOFTWARES COSMOS</span>
        <small>DEVELOPER · SHIVAM</small>
      </div>
    </>
  </StrictMode>
);
