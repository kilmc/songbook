<script lang="ts">
  import { Note } from "@tonaljs/tonal";
  import { WHOLE_NOTE_TICKS } from "../constants/midi";
  import { song } from "../stores/songStore";
  import type { INode, ITrack } from "../types";  
  import TrackNode from "./TrackNode.svelte";
  import type { TRowDisplayValue } from "./trackPreferences";
  import { generateCSSVars } from "./utils";
  
  export let track: ITrack;
  export let gridResolution = 1;
  export let trackColor = "#bbbbbb";
  export let gridLineColor = "#888";
  export let barLineColor = "#000";
  export let barLineOffset = $song.barOffset;

  let trackerPosition = null;
  let showTracker = false;
  
  let rowDisplay: TRowDisplayValue = track.type === "lead-vocal" ? "notes" : "single";
  
  $: blankDuration = WHOLE_NOTE_TICKS / gridResolution;


  const buildNodeRows = (nodes: INode[]) => {    
    if(rowDisplay === 'notes') {
      const groupedNodes = nodes.reduce<{ [k: string]: INode[] }>((accum, node) => {
        accum[node.data]
          ? accum[node.data] = accum[node.data].concat(node)
          : accum[node.data] = [node]
  
        return accum;
      }, {})

      return Object.entries(groupedNodes)
        .sort(([a],[b]) => {
          return Note.midi(b) - Note.midi(a)
        })
        .map(([_, node]) => node)
    } else {
      return nodes
    }
  }
  
  const addNewNode = (event) => {
    const targetColumnIndex = Math.trunc(event.layerX/blankDuration);
    const newNode:INode = {
      position: targetColumnIndex*blankDuration,
      duration: blankDuration,
      data: "",
    }

    const updatedTrack = track;
    updatedTrack.nodes.push(newNode);
    updatedTrack.nodes.sort((a,b)=>(a.position - b.position))
    track = updatedTrack;
  }

	$: cssVarStyles = generateCSSVars({
		'track-color': trackColor,
    'grid-line-color': gridLineColor,
    'bar-line-color': barLineColor,
	})

  const moveTracker = (event) => {
    const targetColumnIndex = Math.trunc(event.layerX/blankDuration);
    trackerPosition = targetColumnIndex*blankDuration;
  }
</script>

<div>
  <div>
    <h2>{track.type}</h2>
    <select bind:value={gridResolution}>
      {#each [1,2,4,8,16,32] as res}
        <option value="{res}">{res}</option>
      {/each}
    </select>
  </div>
  
  <div
    class="track track--grid-{gridResolution} track--bar-offset-{barLineOffset}"
    style={cssVarStyles}
    on:click={addNewNode}
    on:mouseenter={()=>showTracker = true}
    on:mouseleave={()=>showTracker = false}
    on:mousemove={moveTracker}
  >
    <div class="track__row">
      {#each track.nodes as node}
        <TrackNode bind:node gridResolution={gridResolution}/>
      {/each}    
    </div>
  
    <div class="track__bars"></div>
    <div class="track__grid"></div>
    {#if showTracker}
      <div class="tracker" style="left: {trackerPosition}px; width: {blankDuration}px;"></div>
    {/if}
  </div>
</div> 



<style lang="scss">
@import "../scss/mixins.scss";
$row-height: 44px;

.track {
  display: grid;
  grid-auto-rows: $row-height;
  position: relative;
  overflow: visible;
  margin-bottom: 1rem;
  font-family: monospace;
  font-size: 1.5rem;
  background-color: var(--track-color);
  min-height: 24px;
}

.track__row {
  display: grid;
  grid-auto-columns: 12px;
  height: $row-height;
  position: relative;
  z-index: 1;
}

.track__bars {
  @include barLines;

  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 2;
  pointer-events: none;
}

.track__grid {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}

.track__node {
  background-color: goldenrod;
  padding: 0;
  margin: 0;
  position: relative;
  z-index: 1;
}

$resolutions: 1, 2, 4, 8, 16, 32;
@each $size in $resolutions {
  .track--grid-#{$size} .track__grid {
    @include gridLines($size);
  }
}

$barOffset: 2, 4, 8, 16, 32;
@each $size in $barOffset {
  $value: ($WHOLE_NOTE_TICKS - calc($WHOLE_NOTE_TICKS/$size)) + 0px;
  .track--bar-offset-#{$size} {
    .track__bars,    
    .track__grid {
      width: calc(100% + $value);
      left: -$value;
    }
  }
}

.tracker {
  position: absolute;
  top: 0;
  height: 100%;
  background-color: rgba(#FFF,0.5);
  pointer-events: none;
  z-index: 0;
}
</style>