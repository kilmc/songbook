<script lang="ts">
  import { WHOLE_NOTE_TICKS } from "../constants/midi";
  import { song } from "../stores/songStore";
  import type { INode, ITrack } from "../types";
  import Track from "./Track.svelte";

  const lastNodePosition = (nodes: INode[]) => nodes
    .map(node => (node.position + node.duration))
    .sort((a,b) => b - a)[0]

  const getFarthestNodePosition = (tracks: ITrack[]) => tracks
    .map(track => lastNodePosition(track.nodes))
    .sort((a,b) => b - a)[0]

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