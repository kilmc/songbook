<script lang="ts">
  import type { INode } from "../types";
  import { getGridColumn } from "./utils";

  export let node: INode;
  let isEditing = false;
  $: isBlankNode = node.data === "BLANK";

  const toggleEditOn = (event) => {
    event.stopPropagation();
    isEditing = true;
  }
  
  const editNode = (event) => {
    const updatedNode = node;
    updatedNode.data = event.target.value;
    node = updatedNode;
    isEditing = false;
  }
</script>

<span class="track__node" class:track__node--blank={isBlankNode} style="{getGridColumn(node)}" on:click={toggleEditOn}>
  {#if isEditing}
    <input type="text" on:change={editNode} on:blur{editNode} value={node.data}>
  {:else}
    {isBlankNode ? "" : node.data}
  {/if}
</span>

<style lang="scss">
span {
  background-color: goldenrod;
}

.track__node--blank {
  background-color: transparent;

  &:hover {
    background-color: #fff;
  }
}

.track__node {
  &:hover {
    background-color: #fff;
  }
}
</style>