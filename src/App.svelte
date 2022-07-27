<script lang="ts">
  import Chord from './Chord.svelte';
  import { WHOLE_NOTE_TICKS } from './constants/midi';
  import FullSection from './FullSection.svelte';
  import LyricLine from './LyricLine.svelte';
  import MidiInput from './MidiInput.svelte';
  import { song } from './stores/songStore'
  import type { IChord } from './types';
  import merge from 'lodash.merge';

  document.addEventListener('mouseup', (event) => {  
    if(window.getSelection().toString().length){
       let exactText = window.getSelection().toString();    
       currentSegment = exactText
    };
  });

  function saveChord(chord: IChord) {
    song.set({
      ...$song,
      measures: [...$song.measures, ]
    })
    console.log(JSON.stringify(chord))
  }

  let currentSegment = ""
  let name = '';
  let duration = '';
  let position = '';
  let initialLyrics = 'Her name is Noelle\nI had a dream about her';

  const generateLyricsTrack = () => {
    const nodes = initialLyrics
    .split('\n')
    .map((node, index)=>{
      return {
        data: node,
        position: index * WHOLE_NOTE_TICKS,
        duration: WHOLE_NOTE_TICKS,
      }
    });

    song.set(merge($song, {
      tracks: [
        {
          type: "lyrics",
          nodes,
        }
      ]
    }));
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
  <main>
    <h1>Song: {$song.songTitle}</h1>


    <!-- {#each $song.measures as measure}
      <div class="measure">
        {#each measure.chords as chord}
          <Chord chord={chord} />
        {/each}
        <LyricLine lyric={measure.lyrics}/>
      </div>
    {/each} -->

    <!-- <MidiInput /> -->
    <FullSection />
    
  </main>
  <sidebar>
    <div>Lyric segment: {currentSegment}</div>
    <label>Chord: <input bind:value={name} /></label>
    <label>Position: <input bind:value={position} /></label>
    <label>Duration: <input bind:value={duration} /></label>
    <button on:click={() => saveChord({ position, name, duration })}>Save</button>

    <div>
      <textarea bind:value={initialLyrics}></textarea>
      <button on:click={generateLyricsTrack}>Generate lyrics track</button>
    </div>
  </sidebar>
</div>


