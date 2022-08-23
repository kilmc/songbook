<script lang="ts">
  import SketchSection from "./SketchSection.svelte";
  import { sketch } from "./stores/sketchStore";
  import type { ISketchSection } from "./types";

  sketch.subscribe((value) => {
    localStorage.setItem("sketch", JSON.stringify(value));
  });

  const insertNext = (
    sections: ISketchSection[],
    index: number,
    newSection: ISketchSection
  ) => {
    sections.splice(index + 1, 0, newSection);
  };

  const replacePreviousLines = (sectionIndex: number, lineIndex: number) => {
    const lines = $sketch.sections[sectionIndex].lines;
    $sketch.sections[sectionIndex].lines = lines.slice(0, lineIndex);
  };

  const addNewSection = (event, currentIndex: number) => {
    let linesCopy = [...$sketch.sections[currentIndex].lines];
    const newSectionLines = linesCopy.slice(
      event.detail.lineIndex,
      linesCopy.length
    );

    const newSection: ISketchSection = {
      title: "Section",
      lines: [...newSectionLines],
    };
    let sectionsCopy = $sketch.sections;
    replacePreviousLines(currentIndex, event.detail.lineIndex);
    insertNext(sectionsCopy, currentIndex, newSection);
    $sketch.sections = sectionsCopy;
  };
</script>

<div class="sketch-container">
  <div class="sketch">
    {#each $sketch.sections as section, index}
      <SketchSection
        bind:section
        on:new={(event) => addNewSection(event, index)}
      />
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
