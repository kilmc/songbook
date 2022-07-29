<script lang="ts">
  import { song } from "../stores/songStore";
  import InputTrack from "./InputTrack.svelte";
  import { generateCSSVars } from "./utils";
  
  export let gridResolution = 8;
  export let trackColor = "#bbbbbb";
  export let gridLineColor = "#aaa";
  export let gridRowCount = 1;
  export let barLineColor = "#000";
  export let barLineOffset = $song.barOffset;
	
  $: rowsArr = [...new Array(gridRowCount)].map(x => "");

	$: cssVarStyles = generateCSSVars({
		'track-color': trackColor,
    'grid-line-color': gridLineColor,
    'bar-line-color': barLineColor,
	})
</script>

<div class="track track--grid-{gridResolution} track--bar-offset-{barLineOffset}" style={cssVarStyles}>
  <slot />
  <div class="track__bars"></div>
  <div class="track__grid"></div>
  {#each rowsArr as count, i}
    <InputTrack gridResolution={gridResolution} row={i + 1}/>  
  {/each}
  
</div>

<style lang="scss">

$WHOLE_NOTE_TICKS: 384;

@mixin gridLines($resolution) {
  $grid-division: calc($WHOLE_NOTE_TICKS / $resolution);

  background: repeating-linear-gradient(
    90deg,
    transparent,
    transparent #{$grid-division - 1}px,
    var(--grid-line-color) #{$grid-division - 1}px,
    var(--grid-line-color) #{$grid-division}px
  );
}

@mixin barLines {
  background: repeating-linear-gradient(
    90deg,
    transparent,
    transparent #{$WHOLE_NOTE_TICKS - 1}px,
    var(--bar-line-color) #{$WHOLE_NOTE_TICKS - 1}px,
    var(--bar-line-color) #{$WHOLE_NOTE_TICKS}px
  );
}


.track {
  display: grid;
  grid-auto-columns: 12px;
  grid-auto-rows: 24px;
  position: relative;
  overflow: visible;
  margin-bottom: 1rem;
  padding: 0.25rem 0;
  font-family: monospace;
  font-size: 1.5rem;
  background-color: var(--track-color);
}

.track__bars {
  @include barLines;

  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.track__grid {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 0;
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
  $value: ($WHOLE_NOTE_TICKS - calc($WHOLE_NOTE_TICKS/8)) + 0px;
  .track--bar-offset-#{$size} {
    .track__bars,    
    .track__grid {
      width: calc(100% + $value);
      left: -$value;
    }
  }
}
</style>