<script lang="ts">
  import type { INode } from "../types";
  import { getGridColumn } from "./utils";
  import { draggable } from '@neodrag/svelte';
  import type { DragOptions } from '@neodrag/svelte';
  import { WHOLE_NOTE_TICKS } from "../constants/midi";
  
  export let gridResolution: number = 4;
  export let node: INode;
  let isEditing = false;

  const toggleEditOn = (event) => {
    event.stopPropagation();
    isEditing = true;
    const inputEl = document.querySelector('track__node input');
    console.log(inputEl)
  }
  
  const editNode = (event: Event) => {
    if (!(event.target instanceof HTMLInputElement)) return;

    const updatedNode = node;
    updatedNode.data = event.target.value;
    node = updatedNode;
    // isEditing = false;
  }

  let options: DragOptions = {
    axis: "x",
    grid: [WHOLE_NOTE_TICKS / gridResolution,0],
    onDragEnd: (data) => {
      console.log(data.offsetX)
    }
  };
  
  function init(el){
    el.focus()
  }
</script>

<span use:draggable={options} class="track__node" style="{getGridColumn(node)}" on:click={toggleEditOn}>
  {#if isEditing}
    <input type="text" on:change={editNode} on:blur={editNode} value={node.data} use:init />
  {:else}
    {node.data}
  {/if}
</span>

<style lang="scss">
span {
  background-color: goldenrod;
}

.track__node--blank {
  background-color: transparent;
}

.track__node {
  display: block;
  height: 100%;
  padding: 0.5rem;

  input {
    width: 100%;
    height: 100%;
    outline: none;
    border: none;
    border-bottom: 1px solid transparent;

    &:focus { 
      border-color: black;
    }
  }
}
</style>