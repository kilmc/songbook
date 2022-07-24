<script lang="ts">
import { song } from "./songs/teenageDirtbag";
import type { IChord, ISegment } from "./types";
import Chord from './Chord.svelte';


  function getLyricPosition(segment: ISegment) {
    const [beatPosition] = segment.position.split('.').map(parseInt)
    const rowStyle = "grid-row: 2;";
    const columnStyle = `grid-column: ${beatPosition + 1};`

    return `${rowStyle} ${columnStyle}`
  }

  document.addEventListener('mouseup', (event) => {  
    if(window.getSelection().toString().length){
       let exactText = window.getSelection().toString();    
       currentSegment = exactText
    };
  });
  let currentSegment = ""
  let chordName = '';

  function saveChord(chord: string, segment: string) {
    console.log(chord, segment)
  }
</script>

<style>
.measure {
  display: grid;
  grid-template-columns: repeat(5, max-content); /* we're subdiving by 5 to allow for 4 beats plus a leading beat to the left */
  grid-template-rows: repeat(3, auto);
  gap: 0.5ch;
  font-size: 2rem;
}
.songbook-container {
  display: grid;
  grid-template-columns: 1fr 300px;
}
</style>
<div class="songbook-container">
  <main><h1>Song: {song.songTitle}</h1>


    {#each song.measures as measure}
      <div class="measure">
        {#each measure.chords as chord}
          <Chord chord={chord} />
        {/each}
        {#each measure.lyrics.segments as segment}
          <div class="lyric" style={getLyricPosition(segment)}>{segment.text}</div>
        {/each}
      </div>
    {/each}
    
    <div>
      She rings my bell
    </div>
    </main>
    <sidebar>
      <div>Lyric segment: {currentSegment}</div>
      <label>Chord: <input bind:value={chordName} /></label>
      <button on:click={() => saveChord(chordName, currentSegment)}>Save</button>
    </sidebar>
</div>


