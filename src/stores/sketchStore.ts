import { writable } from "svelte/store";
import type { ISongSketch } from "../types";

const dirtbag: ISongSketch = {
  title: "Teenage Dirtbag",
  artist: "Wheatus",
  sections: [
    {
      title: "Section",
      lines: [
        {
          lyric: "",
          chords: [],
        },
      ],
    },
  ],
};

const storedSketch = localStorage.getItem("sketch") || JSON.stringify(dirtbag);
// export const song = writable<ISong>(JSON.parse(storedSong));
export const sketch = writable<ISongSketch>(JSON.parse(storedSketch));