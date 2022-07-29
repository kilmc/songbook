<script lang="ts">
  export let gridResolution = 8;
  export let gridBgColor = "#bbbbbb";
  export let gridLineColor = "#000000";
  
  $: styles = {
		'grid-bg-color': gridBgColor,
    'grid-line-color': gridLineColor,
	};
	
	$: cssVarStyles = Object.entries(styles)
		.map(([key, value]) => `--${key}:${value}`)
		.join(';');
</script>

<div class="track track--grid-{gridResolution}" style={cssVarStyles}>
  <slot />
  <div class="track__bars"></div>
</div>

<style lang="scss">
.track {
  display: grid;
  grid-auto-columns: 12px;
  position: relative;
  overflow: visible;
  margin-bottom: 1rem;
  padding: 0.25rem 0;
  font-family: monospace;
  font-size: 1.5rem;
  height: 2rem;
}

.track__bars {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: -1;
}

.track__node {
  background-color: goldenrod;
  padding: 0;
  margin: 0;
}

.track--grid-32 .track__bars {
  background: repeating-linear-gradient(90deg,var(--grid-bg-color), var(--grid-bg-color) 11px, var(--grid-line-color) 11px, var(--grid-line-color) 12px);
}

.track--grid-16 .track__bars {
  background: repeating-linear-gradient(90deg,var(--grid-bg-color), var(--grid-bg-color) 23px, var(--grid-line-color) 23px, var(--grid-line-color) 24px);
}

.track--grid-8 .track__bars {
  background: repeating-linear-gradient(90deg,var(--grid-bg-color), var(--grid-bg-color) 47px, var(--grid-line-color) 47px, var(--grid-line-color) 48px);
}

.track--grid-4 .track__bars {
  background: repeating-linear-gradient(90deg,var(--grid-bg-color), var(--grid-bg-color) 95px, var(--grid-line-color) 95px, var(--grid-line-color) 96px);
}
</style>