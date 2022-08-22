<script lang="ts">
  import SketchLines from "./SketchLines.svelte";
  import { sketch } from "./stores/sketchStore";

  sketch.subscribe((value) => {
    localStorage.setItem("sketch", JSON.stringify(value));
  });
</script>

<div class="sketch-container">
  <div class="sketch">
    {#each $sketch.sections as section, sectionIndex}
      <div class="sketch__section">
        <h2>{section.title}</h2>
        <SketchLines bind:section />
      </div>
    {/each}
  </div>
</div>

<style lang="scss">
  .sketch-container {
    display: flex;
    flex-direction: column;
  }

  .sketch {
    font-family: monospace;
    font-size: 1.6rem;
  }
</style>
