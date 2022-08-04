<script lang="ts">
  import { WHOLE_NOTE_TICKS } from "./constants/midi";
  import { emptySong, song } from './stores/songStore'
  import merge from 'lodash.merge';
  import AddTracks from './AddTracks.svelte';
  import Tracks from "./tracks/Tracks.svelte";
  import LyricsView from "./LyricsView.svelte";

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

  song.subscribe(value => {
    localStorage.setItem("song", JSON.stringify(value));
  })

  const clearStorage = () => {
    song.set(emptySong)
  } 
</script>

<div class="songbook-container">
  <main class="song">
    <h1>Song: {$song.songTitle}</h1>
    <AddTracks />
    <Tracks />  

    <LyricsView />
  </main>
  <sidebar>
    <div><button class="btn" on:click={clearStorage}>nuke storage</button></div>
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
  width: 100vw;
}

.song {
  width: 100%;
  overflow:hidden;
}
</style>
