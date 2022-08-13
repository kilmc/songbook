import { writable } from "svelte/store";
// import type { ISong } from "../types";
import type { ISong } from "../types-part-2";

const lemonade: ISong = {
  songTitle: "Lemonade",
  segments: [
    {
      position: 0,
      duration: 768,
      chords: [
        {
          position: 384,
          duration: 96,
          charIndex: 17,
          data: "Bb"
        },
        {
          position: 576,
          duration: 96,
          charIndex: 25,
          data: "F"
        },
        {
          position: 720,
          duration: 96,
          charIndex: 33,
          data: "C"
        }
      ],
      leadVocal: {
        lyric: "Just tell me his name"
      }
    },
    {
      position: 0,
      duration: 768,
      chords: [
        {
          position: 0,
          duration: 96,
          charIndex: 0,
          data: "Dm"
        },
        {
          position: 384,
          duration: 96,
          charIndex: 17,
          data: "Bb"
        },
        {
          position: 576,
          duration: 96,
          charIndex: 25,
          data: "F"
        },
        {
          position: 720,
          duration: 96,
          charIndex: 33,
          data: "C"
        }
      ],
      leadVocal: {
        lyric: "Just tell me you didn't get laid in our bedroom"
      }
    }
  ]
}

const dirtbag: ISong = {
  songTitle: "Teenage Dirtbag",
  segments: [
    {
      position: 0,
      duration: 384,
      chords: [
        {
          position: 48,
          duration: 192,
          charIndex: 4,
          data: "E"
        },
        {
          position: 240,
          duration: 192,
          charIndex: 13,
          data: "B"
        }
      ],
      leadVocal: {
        lyric: "Her name is Noelle",
        melodyNodes: []
      }
    }
  ]
}


const tdb = {
  songTitle: "Teenage Dirtbag",
  tracks: [
    {
      type: "lyrics",
      barLyric: "Her name is Noelle",
      nodes: [
        { data: "Her", position: 0, duration: 48 },
        { data: "name is No", position: 48, duration: 192 },
        { data: "elle", position: 240, duration: 192 },
        { data: "I had a", position: 432, duration: 144 },
        { data: "dream", position: 576, duration: 96 },
        { data: "about her", position: 672, duration: 192 },
      ],
    },
    {
      type: "chords",
      nodes: [
        { data: "E", position: 48, duration: 192 },
        { data: "B", position: 240, duration: 192 },
        { data: "E", position: 432, duration: 192 },
        { data: "A", position: 624, duration: 192 },
      ],
    },
    {
      type: "lead-vocal",
      nodes: [
        { data: "G#4", position: 0, duration: 48 },

        { data: "G#4", position: 48, duration: 48 },
        { data: "A4", position: 96, duration: 48 },
        { data: "B4", position: 144, duration: 48 },
        { data: "D#5", position: 192, duration: 48 },

        { data: "G#4", position: 432, duration: 48 },
        { data: "A4", position: 480, duration: 48 },
        { data: "B4", position: 528, duration: 48 },
        { data: "C#5", position: 576, duration: 96 },
        { data: "B4", position: 672, duration: 48 },
      ],
    },
  ],
};

export const emptySong = lemonade;


const storedSong = localStorage.getItem("song") || JSON.stringify(lemonade);
// export const song = writable<ISong>(JSON.parse(storedSong));
export const song = writable<ISong>(dirtbag);
