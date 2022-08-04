<script lang="ts">
  import type { INode } from "../types";
  import { getGridColumn } from "./utils";
  import { draggable } from '@neodrag/svelte';
  import type { DragOptions } from '@neodrag/svelte';
  import { WHOLE_NOTE_TICKS } from "../constants/midi";
  import {shortcut} from '../keyboardShortcuts';
  
  export let gridResolution: number = 4;
  export let node: INode;
  export let onDeleteNode: (delectionNode: INode) => void;
  let isEditing = false;
  let isSelected = false;

  const toggleEditOn = (event) => {
    event.stopPropagation();
    // event.target.focus()
    isSelected = false;
    isEditing = true;
  }
  
  const editNode = (event: Event) => {
    if (!(event.target instanceof HTMLInputElement)) return;
    
    const updatedNode = node;
    updatedNode.data = event.target.value;
    node = updatedNode;
    isEditing = false;
    isSelected = false;
  }

  const toggleSelectNode = (event) => {
    event.stopPropagation();
    isSelected = !isSelected;
  }

  let options: DragOptions = {
    axis: "x",
    grid: [WHOLE_NOTE_TICKS / gridResolution,0],
    onDragEnd: (data) => {
      node.position = node.position + data.offsetX
    }
  };
  
  function init(el){
    el.focus()
  }
</script>

<div
  use:draggable={options}
  class="track__node"
  class:track__node--selected={isSelected}
  style="{getGridColumn(node)}"
  on:click={toggleSelectNode}
  on:dblclick={toggleEditOn}
  use:shortcut={{ control: true, code: "Backspace", callback: () => isSelected ? onDeleteNode(node) : undefined }}
>
  {#if isEditing}
    <input
      type="text"
      on:change={editNode}
      on:blur={editNode}
      value={node.data}
      use:init
    />
  {:else}
    {node.data}
  {/if}
</div>

<style lang="scss">
.track__node {
  background-color: goldenrod;
  display: block;
  height: 100%;
  padding: 0.5rem;
  
  &--selected {
    opacity: 0.75;
  }
  
  &:focus {
    outline: 3px;
  }
  

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