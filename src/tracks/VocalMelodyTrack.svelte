<script lang="ts">
  import type { INode, ITrack } from "../types";
  import Track from "./Track.svelte";
  import { getGridColumn } from "./utils";
  import { Note } from '@tonaljs/tonal';

  export let track: ITrack;

  const sortNotes = (a: string, b: string) => {
    return Note.midi(b) - Note.midi(a)
  }

  const getGridRow = (currentNode: INode, rows: string[]) => {
    const noteRow = rows.indexOf(currentNode.data) + 1;
    return `grid-row: ${noteRow};`
  }
  $: gridRows = [...new Set(track.nodes.map(node => node.data))].sort(sortNotes);
  $: gridRowCount = gridRows.length;
</script>
<div class="track--lead-melody">
  <h2>Vocal melody</h2>
  <Track gridRowCount={gridRowCount}>
    {#each track.nodes as node}
      <span class="lead-vocal__node" style="{getGridColumn(node)}{getGridRow(node,gridRows)}">
        {node.data}
      </span>
    {/each}
  </Track>
</div>  

<style lang="scss">
  .lead-vocal__node {
    background-color: goldenrod;
  }
</style>