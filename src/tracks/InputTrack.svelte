<script>
  import { WHOLE_NOTE_TICKS } from "../constants/midi";
  import { generateCSSVars } from "./utils";
  export let gridResolution = 8;
  export let row = 1;
  export let barLineOffset = 0;

  $: initialArray = [...new Array(gridResolution*8)].map(x => "&nbsp;");
  $: cssVarStyles = generateCSSVars({
		'grid-resolution': `${WHOLE_NOTE_TICKS / gridResolution}px`,
    'bar-line-offset': barLineOffset
	})
</script>
<div class="input-track track--bar-offset-{barLineOffset}" style="{cssVarStyles}; grid-row: {row}">
  {#each initialArray as _, i}
    <div
      class="input-node"
      style="grid-column: {i+1} / span 1"
      on:click="{() => { console.log("HI", i * (WHOLE_NOTE_TICKS / gridResolution))}}"
    />
  {/each}
</div>

<style lang="scss">
@import "../scss/variables.scss";

$barOffset: 2, 4, 8, 16, 32;
@each $size in $barOffset {
  $value: ($WHOLE_NOTE_TICKS - calc($WHOLE_NOTE_TICKS / $size)) + 0px;
  .track--bar-offset-#{$size} {
    width: calc(100% + $value);
    left: -$value;
  }
}

.input-track {
  display: grid;
  grid-auto-columns: var(--grid-resolution);
  position: absolute;
  height: 24px;
  z-index: 2;
}

.input-node {
  background-color: transparent;
  grid-column-end: span 1;

  &:hover {
    background-color: aquamarine;
    opacity: 0.5;
  }
}
</style>