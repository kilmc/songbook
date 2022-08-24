<script lang="ts">
  import SketchSection from "./SketchSection.svelte";
  import { sketch } from "./stores/sketchStore";
  import type { ISketchSection } from "./types";

  let focusedIndex: number;
  let focusedLineIndex: number | undefined = undefined;

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

  const focusPreviousSection = (currentIndex: number) => {
    console.log("PREVIOUS");
    if (currentIndex !== 0) {
      focusedIndex = currentIndex - 1;
      focusedLineIndex = $sketch.sections[currentIndex - 1].lines.length - 1;
    }
  };

  const focusNextSection = (currentIndex: number) => {
    console.log("NEXT");
    if (currentIndex !== $sketch.sections.length - 1) {
      console.log("HERE");
      focusedIndex = currentIndex + 1;
      focusedLineIndex = 0;
    }
  };
</script>

<div class="sketch-container">
  <div class="sketch">
    {#each $sketch.sections as section, index}
      <SketchSection
        bind:section
        focused={focusedIndex === index}
        focusedLine={focusedLineIndex}
        on:new={(e) => addNewSection(e, index)}
        on:focusPrevious={() => focusPreviousSection(index)}
        on:focusNext={() => focusNextSection(index)}
        on:lineFocused={() => {
          console.log("FOCUSEDLINE");
          focusedIndex = index;
        }}
      />
    {/each}
  </div>
</div>

<style lang="scss">
  .sketch-container {
    display: flex;
    flex-direction: column;
    margin: 4rem auto;
  }

  .sketch {
    font-family: monospace;
    font-size: 1.6rem;
  }
</style>
