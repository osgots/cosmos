import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";

import App from "./App.tsx";

import {
  installContinuousRealityZoom
} from "./features/scales/installContinuousRealityZoom";

installContinuousRealityZoom();

createRoot(
  document.getElementById("root")!
).render(
  <StrictMode>
    <App />
  </StrictMode>
);
