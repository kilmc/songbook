<script lang="ts">
  import { WHOLE_NOTE_TICKS } from "./constants/midi";
  import { song } from "./stores/songStore";
  import { getNodeEndPosition } from "./tracks/utils";
  import type { INode, ITrack, TTrackType } from "./types";

  type IBar = {
    [k in TTrackType]?: INode[]
  }

  const groupNodesByBar = (nodes: INode[]): INode[][] => {
    if (nodes.length === 0) { return []}
    const lastNodePosition = getNodeEndPosition(nodes[nodes.length - 1]);
    const barRemainder = lastNodePosition % WHOLE_NOTE_TICKS;
    const barCount = (lastNodePosition - barRemainder) / WHOLE_NOTE_TICKS + 1;
    const barsArray = new Array(barCount === 0 ? 1 : barCount).fill([])

    return barsArray.map((bar,i) => bar.concat(
      nodes.filter(({position}) => {
        return (position >= i*WHOLE_NOTE_TICKS) && (position < (i+1)*WHOLE_NOTE_TICKS)
      })
    ))
  }

  const tracksToBars = (tracks: ITrack[]): IBar[] => {
    if (tracks.length < 1) { return []}
    const nodesGroupedByBars = tracks
      .map(track => ({
        type: track.type,
        bars: groupNodesByBar(track.nodes)
      }));
    const highestBarCount = nodesGroupedByBars
      .map(track => track.bars.length)
      .sort((a,b) => b - a)[0];

    const groupedByBars = new Array(highestBarCount + 1)
      .fill([])
      .reduce<IBar[]>((accum,_,i) => {
        const result = nodesGroupedByBars.reduce<IBar>((bar,track) => {

          if(bar[track.type]) {
            bar[track.type] = bar[track.type].concat(track.bars[i])
          } else {
            bar[track.type] = track.bars[i]
          }
          
          return bar;
        },{})

        return accum.concat(result);
      },[])
      // .filter(bar => bar.chords)
    
    return groupedByBars;
  }

  const renderBarNodes = (nodes: INode[]) => {
    if (nodes === undefined || nodes.length < 1) { return ""}

    return nodes.map(node => node.data).join('')
  }
  

  let tracks = $song.tracks;
  $: bars = tracksToBars(tracks);
</script>

<div class="lyrics-view">
  {#each bars as barGroup}
    {#each Object.entries(barGroup) as [type, bar]}
      <p>{renderBarNodes(bar)}</p>
    {/each}
  {/each}
</div>

<style>
.lyrics-view {
  font-family: monospace;
  font-size: 2rem;
}
</style>