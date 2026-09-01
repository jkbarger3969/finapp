import type { SyncApi } from "../preload/index";

declare global {
  interface Window {
    syncApi: SyncApi;
  }
}

export {};
