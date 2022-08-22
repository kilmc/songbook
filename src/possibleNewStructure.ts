// interface INode {
//   position: number;
//   duration: number;
//   data: string;
// }

// interface IVocalMelodyNode extends INode {
//   lyricSlice: string;
// }

// interface ILyricLine extends INode {
//   melodyNodes: IVocalMelodyNode[];
// }

// interface IVocalTrack {
//   type: "vocal";
//   nodes: ILyricLine[];
// }

// interface IRhythmTrack {
//   chords: INode[];
//   rhythm: INode[];
// }

// const vocalTrack: IVocalTrack = {
//   type: "vocal",
//   nodes: [
//     {
//       data: "Just tell me his name",
//       position: 0,
//       duration: 768,
//       melodyNodes: [
//         {
//           position: 0,
//           duration: 48,
//           lyricSlice: "Just",
//           data: "A3",
//         },
//         {
//           position: 48,
//           duration: 48,
//           lyricSlice: "tell",
//           data: "G3",
//         },
//         {
//           position: 96,
//           duration: 48,
//           lyricSlice: "me",
//           data: "F3",
//         },
//         {
//           position: 144,
//           duration: 48,
//           lyricSlice: "his",
//           data: "E3",
//         },
//         {
//           position: 192,
//           duration: 192,
//           lyricSlice: "na",
//           data: "D3",
//         },
//         {
//           position: 384,
//           duration: 48,
//           lyricSlice: "me",
//           data: "D3",
//         },
//       ],
//     },
//     {
//       data: "Just tell me you didn't get laid in our bedroom",
//       position: 768,
//       duration: 768,
//       melodyNodes: [
//         {
//           position: 0,
//           duration: 48,
//           lyricSlice: "Just",
//           data: "A3",
//         },
//         {
//           position: 48,
//           duration: 48,
//           lyricSlice: "tell",
//           data: "G3",
//         },
//         {
//           position: 96,
//           duration: 48,
//           lyricSlice: "me",
//           data: "F3",
//         },
//         {
//           position: 144,
//           duration: 48,
//           lyricSlice: "you",
//           data: "E3",
//         },
//         {
//           position: 192,
//           duration: 96,
//           lyricSlice: "di",
//           data: "A3",
//         },
//         {
//           position: 288,
//           duration: 48,
//           lyricSlice: "dn't",
//           data: "A#3",
//         },
//         {
//           position: 336,
//           duration: 48,
//           lyricSlice: "get",
//           data: "A3",
//         },
//         {
//           position: 384,
//           duration: 96,
//           lyricSlice: "laid",
//           data: "G3",
//         },
//         {
//           position: 480,
//           duration: 48,
//           lyricSlice: "in",
//           data: "F3",
//         },
//         {
//           position: 528,
//           duration: 48,
//           lyricSlice: "our",
//           data: "E3",
//         },
//         {
//           position: 576,
//           duration: 96,
//           lyricSlice: "bed",
//           data: "D3",
//         },
//         {
//           position: 672,
//           duration: 96,
//           lyricSlice: "bed",
//           data: "C3",
//         },
//       ],
//     },
//   ],
// };

// // Track Types

// // Rhythm instrument
// // - Chords
// // - Rhythm

// // Lead instrument
// // - Melody

// // Vocals
// // - Lyrics
// // - Melody

// // Harmony
// // - Lyrics
// // - Melody
