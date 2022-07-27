import { writable } from "svelte/store";

const tdb = {
  song: "Teenage",
  tracks: [
    {
      type: "lyrics",
      originalLyric: "Her name is Noelle",
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
        { data: "D#5", position: 240, duration: 48 },
        
        { data: "G#4", position: 432, duration: 48 },
        { data: "A4", position: 480, duration: 48 },
        { data: "B4", position: 528, duration: 48 },
        { data: "C#5", position: 576, duration: 96 },
        { data: "B4", position: 672, duration: 48 },
      ],
    },
  ],
};

const emptySong = {
  songTitle: "Teenage",
  tracks: [],
}

export const song = writable(emptySong);
