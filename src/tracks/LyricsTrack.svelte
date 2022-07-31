<script lang="ts">
  import { song } from "../stores/songStore";
  import type { INode, ITrack } from "../types";
  import Track from "./Track.svelte";
  import { getGridColumn } from "./utils";
  
  const splitLyric = (node: INode, index: number, nodes: INode[]) => {
    const split1 = node.data.slice(0,index + 1).trim();
    const split2 = node.data.slice(index +1).trim();
    const result = [split1,split2]
      .map((lyricSlice,i) => ({
        data: lyricSlice,
        duration: node.duration / 2,
        position: node.position + (node.duration/2)*i
      }));

    const oldNodeIndex = nodes.findIndex(newNode => newNode.data === node.data)
    
    // Replace old node with new nodes
    nodes.splice(oldNodeIndex,1,...result)
    
    //this sets the prop track with the new track structure. 
    //because the track is bound, the change reflects all the way up the store and triggers a full re-render
    track = {
      type: "lyrics",
      nodes,
    };
    console.log($song)
  }

  export let track: ITrack;
</script>

<Track track={} />

<!-- {#each track.nodes as node}
<span style={getGridColumn(node)}>
  {#each node.data.split('') as char, i}
    <span class="lyric-char" on:click={() => splitLyric(node,i,track.nodes)}>{char}</span>
  {/each}
</span>
{/each}   -->


<style lang="scss">
.lyric-char:hover {
  background: transparent;
  border: 0;
  padding: 0;
  margin: 0;
  display: inline;
  position: relative;


  &::after {
    content: "";
    position: absolute;
    right: 0;
    width: 2px;
    height: 100%;
    background-color: black;
  }
}
</style>