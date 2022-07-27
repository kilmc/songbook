<script lang="ts">
  import { WHOLE_NOTE_TICKS } from './constants/midi';
  import FullSection from './FullSection.svelte';
  import { song } from './stores/songStore'
  import merge from 'lodash.merge';

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

<div class="songbook-container">
  <main>
    <h1>Song: {$song.songTitle}</h1>
    <FullSection />
    
  </main>
  <sidebar>
    <div>
      <textarea bind:value={initialLyrics}></textarea>
      <button on:click={generateLyricsTrack}>Generate lyrics track</button>
    </div>
  </sidebar>
</div>

<style>
.songbook-container {
  display: grid;
  grid-template-columns: 1fr 300px;
}
</style>
