<script lang="ts">
  import { WHOLE_NOTE_TICKS } from './constants/midi';
  import FullSection from './FullSection.svelte';
  import { song } from './stores/songStore'
  import merge from 'lodash.merge';
  import Track from './Track.svelte';

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
    <div class="test-track">
      <Track gridResolution={8}>
        <div style="grid-column: 1 / span 8">One</div>
        <div style="grid-column: 9 / span 8">Two</div>
        <div style="grid-column: 17 / span 8">Three</div>
      </Track>
    </div>
    
  </main>
  <sidebar>
    <div>
      <textarea bind:value={initialLyrics}></textarea>
      <button class="btn" on:click={generateLyricsTrack}>Generate lyrics track</button>
    </div>
  </sidebar>
</div>

<style>
.songbook-container {
  display: grid;
  grid-template-columns: 1fr 300px;
}
.test-track {
  width: 100%;
}

.btn {
  padding: 0.5rem 1rem;
  background-color: black;
  color: white;
}
</style>
