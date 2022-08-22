<script lang="ts">
  import { song } from "./stores/songStore";

  const getChordPosition = (chord, segment) => {
    const nrCharsThisLine = segment.duration / segment.leadVocal.lyric.length;
    const position = Math.trunc(chord.position / nrCharsThisLine);
    return position;
  };
</script>

<div class="vertical-view">
  {#each $song.segments as segment}
    <div class="chord-track">
      {#each segment.chords as chord}
        <span style="position: relative; left: {chord.charIndex}ch"
          >{chord.data}</span
        >
      {/each}
    </div>

    <p>{segment.leadVocal.lyric}</p>
  {/each}
</div>

<style>
  .vertical-view {
    font-family: monospace;
    font-size: 2rem;
  }

  .letter {
    width: 1ch;
    background-color: red;
    height: 2rem;
    display: inline-block;
  }

  .chord-track {
    display: inline-block;
  }
</style>
