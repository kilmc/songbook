<script lang="ts">
  import { song } from "../src/stores/songStore";

  const getPosition = (node) => {
    const value = Math.trunc(node.position/12);
    return value == 0 ? 1 : value +1;
  };

  const getDuration = (node) => {
    const value = Math.trunc((node.duration)/12);
    return value;
  }
</script>

<div class="tracks">
  {#each $song.tracks as track}
    <div class="track {track.type}">
      {#each track.nodes as node}
        <span style="grid-column: {getPosition(node)} / span {getDuration(node)}">
          {node.data}
        </span>
      {/each}
      <div class="bars"></div>
    </div>
  {/each}
  
</div>

<style lang="scss">

  .tracks {
    display: flex;
    flex-direction: column;
    overflow: scroll;
  }
  
  .track {
    display: grid;
    grid-auto-columns: 12px;
    position: relative;
    overflow: visible;
    margin-bottom: 1rem;

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