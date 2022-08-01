<script lang="ts">
  import { Note } from "@tonaljs/tonal";
  import { WHOLE_NOTE_TICKS } from "../constants/midi";
  import { song } from "../stores/songStore";
  import type { INode, ITrack } from "../types";  
  import TrackNode from "./TrackNode.svelte";
  import type { TRowDisplayValue } from "./trackPreferences";
  import { generateCSSVars, getNodeEndPosition, numberRangesOverlap } from "./utils";
  
  export let track: ITrack;
  export let gridResolution = 8;
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


  const splitNode = (node: INode) => {
    const barOffsetDuration = WHOLE_NOTE_TICKS / barLineOffset
    let splitNotes;

    if(node.position === 0 && barLineOffset > 0) {
      splitNotes = [
        { data: "BLANK", position: 0, duration: barOffsetDuration},
        ...splitNode({ data: "BLANK", position: barOffsetDuration, duration: node.duration - barOffsetDuration})
      ]
      return splitNotes.flat()
    } else {
      const splitNodeDuration = WHOLE_NOTE_TICKS / gridResolution;
      const remainder = node.duration % splitNodeDuration;
      const numberOfSplits = (node.duration - remainder) / splitNodeDuration;
      const nodeOverlapSize = (node.position + barOffsetDuration) % splitNodeDuration;
      const startsInTheMiddleOfNodeDuration = nodeOverlapSize > 0;

      return [...new Array(numberOfSplits)
        .fill({ data: "BLANK", position: 0, duration: splitNodeDuration  })]
        .flatMap((splitNode,i) => {
          let newPosition;

          if (startsInTheMiddleOfNodeDuration && i === 0) {
            console.log("HERE",splitNode,node.position + (i * splitNodeDuration))
            // newPosition = node.position + nodeOverlapSize
            newPosition = node.position + (i * splitNodeDuration)
          } else {
            newPosition = node.position + (i * splitNodeDuration)
          }

          return { ...splitNode, position: newPosition }
      })
    }
  }

  const getGaps = (nodes: INode[]) => {
    const firstNode = nodes[0];
    const lastNode = nodes[nodes.length - 1];
    
    // console.log(nodes)
    return nodes
      .reduce((accum, node,i) => {
        const nodeEndPosition = getNodeEndPosition(node);
        const hasNextNode = nodes[i+1] !== undefined;
        const isLastNode = !hasNextNode;
        const isFirstNode = i === 0
        const firstAndOnlyNode = !hasNextNode && isFirstNode;
        const isPositionZero = node.position === 0;

        const endBlanks = { data: "BLANK", position: nodeEndPosition, duration: 1000 }
        const startBlanks = { data: "BLANK", position: 0, duration: node.position }
        
        if(firstAndOnlyNode) {
          if(isPositionZero) {
            accum.concat(node,endBlanks)
          } else {
            return accum.concat(startBlanks,node,endBlanks);
          }
        }
        
        if(isLastNode) {
          return accum.concat(node,endBlanks);
        }
        
        const positionOfNextNode = nodes[i+1].position;
        const offsetFirstNode = isFirstNode && !isPositionZero;
        const noGap = nodeEndPosition === positionOfNextNode;
        const spaceBetweenBlanks = { data: "BLANK", position: nodeEndPosition, duration: positionOfNextNode - nodeEndPosition }
        
        if(offsetFirstNode) {
          if(noGap) {
            return accum.concat(startBlanks, node)
          } else {
            return accum.concat(startBlanks, node, spaceBetweenBlanks);
          }
        }
    
        

        if(noGap) {
          return accum.concat(node);
        } else {
          return accum.concat(node, spaceBetweenBlanks);
        }
        
    },[])
    .flatMap(node => {
      if(node.data === "BLANK") {
        return splitNode(node);
      } else {
        return node;
      }
    });
  }
  
  const getNodeRows = (nodes: INode[], gridResolution: number) => {
    const blankDuration = WHOLE_NOTE_TICKS / gridResolution;
    const builtRows = buildNodeRows(nodes).map(getGaps);
    console.log(builtRows)
    return builtRows
  }



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