/// <reference types="vite/client" />

import type { PawseApi } from "../preload";

declare global {
  interface Window {
    pawse: PawseApi;
  }
}
