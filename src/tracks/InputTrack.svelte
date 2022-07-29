<script>
  import { WHOLE_NOTE_TICKS } from "../constants/midi";
  import { generateCSSVars } from "./utils";
  export let gridResolution = 8;
  export let row = 1;

  $: initialArray = [...new Array(gridResolution*8)].map(x => "&nbsp;");
  $: cssVarStyles = generateCSSVars({
		'grid-resolution': `${WHOLE_NOTE_TICKS / gridResolution}px`,
	})
</script>
<div class="input-track" style="{cssVarStyles}; grid-row: {row}">
  {#each initialArray as _, i}
    <div class="input-node" style="grid-column: {i+1} / span 1"></div>  
  {/each}
</div>

<style lang="scss">
  .input-track {
    display: grid;
    grid-auto-columns: var(--grid-resolution);
    position: absolute;
    width: 100%;
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