/// <reference types="vite/client" />

import type { PawPalApi } from "../preload";

declare global {
  interface Window {
    pawpal: PawPalApi;
  }
}
