<script lang="ts">
  import { WHOLE_NOTE_TICKS } from "../constants/midi";
  import { song } from "../stores/songStore";
  import Track from "./Track.svelte";
  import { getFarthestNodePosition } from "./utils";

  $: trackWidth = getFarthestNodePosition($song.tracks) + (WHOLE_NOTE_TICKS * 4);
</script>

<div class="tracks-wrapper">
  <div class="tracks" style="width: {trackWidth}px">
    {#each $song.tracks as track}
      <Track bind:track />
    {/each}
  </div>
</div>


<style lang="scss">
  .tracks-wrapper {
    width: 100%;
    overflow: scroll;
  }

  .tracks {
    display: flex;
    flex-direction: column;
    overflow: scroll;
  }
</style>