import { writable } from "svelte/store";

const tdb = {
  songTitle: "Teenage Dirtbag",
  artist: "Wheatus",
  measures: [
    {
      chords: [
        {
          name: "E",
          notes: ["E", "G#", "B"],
          duration: "1.0",
          position: "1.0",
          degree: "I",
        },
        {
          name: "B",
          notes: ["B", "D#", "F#"],
          duration: "1.0",
          position: "3.0",
          degree: "V",
        },
      ],
      lyrics: {
        text: "Her name is Noelle",
        segments: [
          {
            text: "Her",
            position: "-1.0",
          },
          {
            text: "name is No",
            position: "1.0",
          },
          {
            text: "elle",
            position: "3.0",
          },
        ],
      },
    },
    {
      chords: [
        {
          name: "E",
          notes: ["E", "G#", "B"],
          duration: "1.0",
          position: "1.0",
          degree: "I",
        },
        {
          name: "A",
          notes: ["A", "C", "E"],
          duration: "1.0",
          position: "3.0",
          degree: "IV",
        },
      ],
      lyrics: {
        text: "I have a dream about her",
        segments: [
          {
            text: "I have a",
            position: "1.0",
          },
          {
            text: "dream about her",
            position: "3.0",
          },
        ],
      },
    },
    {
      chords: [],
      lyrics: {
        text: "She rings my bell",
      },
    },
  ],
};

export const song = writable(tdb);
