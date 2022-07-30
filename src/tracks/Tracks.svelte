<script lang="ts">
  import { song } from "../stores/songStore";
  import type { TTrackType } from "../types";
  import ChordsTrack from "./ChordsTrack.svelte";
  import LyricsTrack from "./LyricsTrack.svelte";
  import VocalMelodyTrack from "./VocalMelodyTrack.svelte";

  const trackMap: { [k in TTrackType]: any } = {
    lyrics: LyricsTrack,
    chords: ChordsTrack,
    'lead-vocal': VocalMelodyTrack,
  }
</script>

<div class="tracks">
  {#each $song.tracks as track}
    <svelte:component this={trackMap[track.type]} bind:track />
  {/each}
</div>

<style lang="scss">
  .tracks {
    display: flex;
    flex-direction: column;
    overflow: scroll;
  }
</style>