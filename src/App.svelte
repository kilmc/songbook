<script lang="ts">
  interface ISong {
    songTitle: string;
    artist: string;
    measures: IMeasure[];
  }
  interface IMeasure {
    chords?: IChord[];
    lyrics?: ILyric;
  }
  interface IChord {
    name: string;
    notes: string[];
    duration: string;
    position: string;
    degree: TDegree;
  }
  interface ILyric {
    text: string;
    segments: ISegment[];
  }
  interface ISegment {
    text: string;
    position: string;
  }

  type TDegree = "I"|"ii"|"iii"|"IV"|"V"|"vi"|"vii";

	let song:ISong = {
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
            degree: "I"
          },
          {
            name: "B",
            notes: ["B", "D#", "F#"],
            duration: "1.0",
            position: "3.0",
            degree: "V"
          }
        ],
        lyrics: {
          text: "Her name is Noelle",
          segments: [
            {
              text: "Her",
              position: "-1.0"
            },
            {
              text: "name is No",
              position: "1.0"
            },
            {
              text: "elle",
              position: "3.0"
            }
          ]
        }
      }
    ]
  }

</script>

<style>
  .measure {
    display: grid;
    grid-template-columns: repeat(5, 1fr); /* we're subdiving by 5 to allow for 4 beats plus a leading beat to the left */
    grid-template-rows: repeat(3, 100px);
  }

  .beat {
    grid-row: 1 / span 1;
  }

  .beat-1 {
    grid-column: 2 / span 1;
    
  }

  .chord-1 {
    grid-column: 2 / span 1;
  }

  .chord-2 {
    grid-column: 4 / span 1;
  }



  .leading {
  }


</style>

<h1>Song: {song.songTitle}</h1>
<div class="measure">
  <div class="beat beat-1">1</div>
  <div class="beat beat-2">2</div>
  <div class="beat beat-3">3</div>
  <div class="beat beat-4">4</div>
  <div class="chord chord-1">E</div>
  <div class="chord chord-2">B</div>
  <div class="lyric lyric-1">Her</div>
  <div class="lyric lyric-2">name is No</div>
  <div class="lyric lyric-2">elle</div>
</div>

{#each song.measures as item}
  
{/each}


