<script lang="ts">
import type { ILyric, ISegment } from "./types";
  function getLyricPosition(segment: ISegment) {
    const [beatPosition] = segment.position.split('.').map(parseInt)
    const rowStyle = "grid-row: 2;";
    const columnStyle = `grid-column: ${beatPosition + 1};`

    return `${rowStyle} ${columnStyle}`
  }

  export let lyric: ILyric;
</script>

{#if lyric.segments?.length > 0}
  {#each lyric.segments as segment}
    <div class="lyric" style={getLyricPosition(segment)}>{segment.text}</div>
  {/each}
{:else}
  <div class="lyric">{lyric.text}</div>
{/if}