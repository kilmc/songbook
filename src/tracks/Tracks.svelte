<script lang="ts">
  import { song, TTrackType } from "./stores/songStore";
  import ChordsTrack from "./tracks/ChordsTrack.svelte";
  import LyricsTrack from "./tracks/LyricsTrack.svelte";
  import VocalMelodyTrack from "./tracks/VocalMelodyTrack.svelte";

  const trackMap: { [k in TTrackType]: any } = {
    lyrics: LyricsTrack,
    chords: ChordsTrack,
    'lead-vocal': VocalMelodyTrack,
  }
</script>

<div class="tracks">
  {#each $song.tracks as track}
    <svelte:component this={trackMap[track.type]} track={track} />
  {/each}
</div>

<style lang="scss">
  .tracks {
    display: flex;
    flex-direction: column;
    overflow: scroll;
  }
</style>