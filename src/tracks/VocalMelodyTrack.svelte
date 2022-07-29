<script lang="ts">
import type { ITrack } from "../stores/songStore";

import Track from "./Track.svelte";
import { getGridColumn } from "./utils";
export let track: ITrack;
</script>
<div>
  <h2>Vocal melody</h2>
  <Track>
    {#each track.nodes as node}
      <span style="{getGridColumn(node)}">
        {node.data}
      </span>
    {/each}
  </Track>
</div>  
