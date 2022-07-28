<script lang="ts">
  import { INode, song } from "./stores/songStore";
  import ChordsTrack from "./ChordsTrack.svelte";
  import LyricsTrack from "./LyricsTrack.svelte";

  const trackMap = {
    lyrics: LyricsTrack,
    chords: ChordsTrack
  }


  const getPosition = (node: INode) => {
    const value = Math.trunc(node.position/12);
    return value == 0 ? 1 : value +1;
  };

  const getDuration = (node: INode) => {
    const value = Math.trunc((node.duration)/12);
    return value;
  }

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
    
    song.set(Object.assign($song,{
      tracks: [
        {
          type: "lyrics",
          nodes,
        }
      ]
    }));
    console.log($song)
  }
</script>

<div class="tracks">
  {#each $song.tracks as track}
    <svelte:component this={trackMap[track.type]}>
      {#each track.nodes as node}
        <span style="grid-column: {getPosition(node)} / span {getDuration(node)}">
          {#each node.data.split('') as char, i}
            <span class="lyric-char" on:click={() => splitLyric(node,i,track.nodes)}>{char}</span>
          {/each}
        </span>
      {/each}  
    </svelte:component>
  {/each}
  
</div>

<style lang="scss">

  .tracks {
    display: flex;
    flex-direction: column;
    overflow: scroll;
  }

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
  
  .track {
    display: grid;
    grid-auto-columns: 12px;
    position: relative;
    overflow: visible;
    margin-bottom: 1rem;
    padding: 0.25rem 0;
    font-family: monospace;
    font-size: 1.5rem;

    &.chords {
      span:nth-of-type(1) {
       
        grid-column: 2 / span 1;
      }

      span:nth-of-type(2) {
       
        grid-column: 5 / span 1;
      }
    }

    &.vocal-melody {
      grid-template-rows: repeat(4, auto);

      span:nth-of-type(1) {
        grid-row: 4;
        grid-column: 1 / span 1;
      }

      span:nth-of-type(2) {
        grid-row: 4;
        grid-column: 2 / span 1;
      }
      span:nth-of-type(3) {
        grid-column: 3 / span 1;
        grid-row: 3;
      }
      span:nth-of-type(4) {
        grid-column: 4 / span 1;
        grid-row: 2;
      }
      span:nth-of-type(5) {
        grid-column: 5 / span 1;
        grid-row: 1;
      }
    }
  }

  .bars {
    position: absolute;
    width: 100%;
    height: 100%;
    background: #BBBBBB;
    background: linear-gradient(90deg, rgba(0,0,0,0.5) 0rem, transparent 0.125rem) 0px 0px,#BBB;
    background-size: 48px, 0.125rem;
    z-index: -1;
  }

</style>