import { writable } from "svelte/store";

interface IApp {
  selectedTrack?: number;
  selectedNode?: number;
}

export const app = writable<IApp>({});
