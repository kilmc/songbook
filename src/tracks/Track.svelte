<script lang="ts">
  import { Note } from "@tonaljs/tonal";
  import { WHOLE_NOTE_TICKS } from "../constants/midi";
  import { song } from "../stores/songStore";
  import type { INode, ITrack } from "../types";  
  import TrackNode from "./TrackNode.svelte";
  import type { TRowDisplayValue } from "./trackPreferences";
  import { generateCSSVars, getNodeEndPosition, numberRangesOverlap } from "./utils";
  
  export let track: ITrack;
  export let gridResolution = 4;
  export let trackColor = "#bbbbbb";
  export let gridLineColor = "#aaa";
  export let barLineColor = "#000";
  export let barLineOffset = $song.barOffset;
  
  let rowDisplay: TRowDisplayValue = track.type === "lead-vocal" ? "notes" : "single";

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
      return [nodes]
    }
  }
  
  const getNodeRows = (nodes: INode[], gridResolution: number) => {
    const blankDuration =  WHOLE_NOTE_TICKS / gridResolution;

    return buildNodeRows(nodes)
      // .map(row =>[...new Array(gridResolution*8)]
      // .map((_,i) => { 
      //   const offsetBlankDuration = WHOLE_NOTE_TICKS / barLineOffset;
      //   if (barLineOffset > 0 && i === 0) {
      //     return {
      //       data: "BLANK",
      //       duration: offsetBlankDuration,
      //       position: offsetBlankDuration * i
      //     }
      //   }
      //   return {
      //     data: "BLANK",
      //     duration: blankDuration,
      //     position: barLineOffset > 0 ? (blankDuration * i) - offsetBlankDuration : blankDuration * i
      //   }
      // })
      // .reduce<INode[]>((accum, blank) => {
      //   const blankEndPosition = getNodeEndPosition(blank);
      //   const matchedNodeIndex = row.findIndex(node => numberRangesOverlap(
      //     blank.position,
      //     blankEndPosition,
      //     node.position,
      //     getNodeEndPosition(node)
      //   ));
      
      //   if (matchedNodeIndex === -1){
      //     return accum.concat(blank)
      //   }

      //   const matchedNode = row[matchedNodeIndex];
      //   const matchedNodeEndPosition = getNodeEndPosition(matchedNode);

      //   const isFullyContainedByNode = blank.position >= matchedNode.position && blankEndPosition <= matchedNodeEndPosition;
      //   const isAlreadyAdded = accum.findIndex(node => node.data === matchedNode.data) !== -1;

      //   if (isFullyContainedByNode && !isAlreadyAdded) {
      //     console.log("FULL")
      //     console.log(matchedNode)
      //     console.log(blank)

      //     return accum.concat(matchedNode)
      //   }

      //   const startsBeforeNode = blank.position < matchedNode.position;
      //   const endsWithinNode = blankEndPosition < matchedNodeEndPosition;
      //   const startsWithinNode = blank.position >= matchedNode.position;
      //   const endsAfterNode = blankEndPosition <= matchedNodeEndPosition;
      //   const isPartiallyContainedByNode = (startsBeforeNode && endsWithinNode) || (startsWithinNode && endsAfterNode)

      //   if(isPartiallyContainedByNode) {
      //     console.log("PARTIAL")
      //     console.log(matchedNode)
      //     console.log(blank)
      //     return accum.concat(matchedNode)
      //   }






      //   return accum
      // },[]))
  }

  console.log(track.type)

  $: nodeRows = getNodeRows(track.nodes,gridResolution)
	$: cssVarStyles = generateCSSVars({
		'track-color': trackColor,
    'grid-line-color': gridLineColor,
    'bar-line-color': barLineColor,
	})
</script>

<div>
  <h2>{track.type}</h2>
  <div class="track track--grid-{gridResolution} track--bar-offset-{barLineOffset}" style={cssVarStyles}>
    {#each Object.values(nodeRows) as row}
      <div class="track__row">
        {#each row as node}
          <TrackNode node={node} />
        {/each}    
      </div>
    {/each}
    
    <div class="track__bars"></div>
    <div class="track__grid"></div>
  </div>
</div> 



<style lang="scss">
@import "../scss/mixins.scss";

.track {
  display: grid;
  grid-auto-rows: 30px;
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
}

.track__bars {
  @include barLines;

  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 1;
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
}

$resolutions: 4, 8, 16, 32;
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
</style>