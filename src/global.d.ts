import type { PlatformBridge } from "./types";

declare global {
  interface Window {
    platform: PlatformBridge;
  }
}
