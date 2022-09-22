import { writable } from "svelte/store";
import { browser } from '$app/environment';
import type { TSong } from "../types";

const dirtbag: TSong = `Verse 1 ---
E           A@@@
Her name is Noelle`;

const storedSong = browser && localStorage.getItem("song") || dirtbag;
export const song = writable<TSong>(storedSong);

if (browser) {
  song.subscribe((value) => {
    localStorage.setItem("song", value);
  });
}