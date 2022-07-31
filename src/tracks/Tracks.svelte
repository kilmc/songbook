<script lang="ts">
  import { song } from "../stores/songStore";
  import Track from "./Track.svelte";
</script>

<div class="tracks">
  {#each $song.tracks as track}
    <Track bind:track />
  {/each}
</div>

<style lang="scss">
  .tracks {
    display: flex;
    flex-direction: column;
    overflow: scroll;
  }
</style>