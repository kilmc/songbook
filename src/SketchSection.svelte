<script lang="ts">
  import { tick, createEventDispatcher, afterUpdate } from "svelte";
  import type { ISketchLine, ISketchSection } from "./types";

  export let section: ISketchSection;
  export let focused: boolean;
  export let focusedLine: number | undefined;

  let cursorPosition: number;
  let lineRefs = [];

  const dispatch = createEventDispatcher();

  const handleNewSectionClick = (lineIndex: number) => {
    dispatch("new", { lineIndex });
  };

  // Focus management
  const focusPrevious = () => {
    lineRefs[focusedLine - 1].focus();
  };

  const focusNext = () => {
    lineRefs[focusedLine + 1].focus();
  };

  const focusCurrentAtCursor = () => {
    lineRefs[focusedLine].setSelectionRange(cursorPosition, cursorPosition);
  };

  const focusPreviousAtCursor = () => {
    lineRefs[focusedLine - 1].setSelectionRange(cursorPosition, cursorPosition);
  };

  const focusNextAtCursor = () => {
    lineRefs[focusedLine + 1].setSelectionRange(cursorPosition, cursorPosition);
  };

  const focusPreviousAtEnd = (previousEnd: number) => {
    lineRefs[focusedLine - 1].setSelectionRange(previousEnd, previousEnd);
  };

  const focusCurrentStart = () => {
    lineRefs[focusedLine].setSelectionRange(0, 0);
  };

  const focusNextStart = () => {
    lineRefs[focusedLine + 1].setSelectionRange(0, 0);
  };

  // Line deletion
  const deleteCurrent = (newLyrics: ISketchLine[]) => {
    newLyrics.splice(focusedLine, 1);
  };

  const deleteNext = (newLyrics: ISketchLine[]) => {
    newLyrics.splice(focusedLine + 1, 1);
  };

  const splitCurrent = (newLyrics: ISketchLine[], current: string) => {
    newLyrics.splice(focusedLine, 1, {
      lyric: current.substring(0, cursorPosition),
      chords: [],
    });
  };

  const combineCurrentAndPrevious = (
    newLyrics: ISketchLine[],
    currentLyric: string
  ) => {
    newLyrics.splice(focusedLine - 1, 1, {
      lyric: section.lines[focusedLine - 1].lyric + currentLyric,
      chords: [],
    });
  };

  const combineNextAndCurrent = (
    newLyrics: ISketchLine[],
    currentLyric: string
  ) => {
    newLyrics.splice(focusedLine, 1, {
      lyric: currentLyric + section.lines[focusedLine + 1].lyric,
      chords: [],
    });
  };

  const insertEmptyNext = (newLyrics: ISketchLine[]) => {
    newLyrics.splice(focusedLine, 1, { lyric: "", chords: [] });
  };

  const replaceNext = (newLyrics: ISketchLine[], content: string) => {
    newLyrics.splice(focusedLine + 1, 0, { lyric: content, chords: [] });
  };

  const updateLyrics = async (newLyrics: ISketchLine[]) => {
    section.lines = newLyrics;
    await tick();
  };

  const handleLyricKeydown = async (e: KeyboardEvent) => {
    const target = e.target as HTMLInputElement;
    const lyrics = section.lines;
    const newLyrics = [...lyrics];

    cursorPosition = target.selectionStart;

    const isEmptyLine = target.value.length === 0;
    const isFirstLine = focusedLine === 0;
    const isLastLine = focusedLine === lyrics.length - 1;
    const isFocusedOnFirstLine = focusedLine === 0;
    const isFocusedOnLastLine = focusedLine + 1 === lyrics.length;
    const isCursorAtStart = cursorPosition === 0;
    const isCursorAtEnd = cursorPosition === target.value.length;
    const isCursorBetween =
      cursorPosition > 0 && cursorPosition < target.value.length - 1;

    if (e.key === "Backspace") {
      if (isEmptyLine) {
        e.preventDefault();
        deleteCurrent(newLyrics);
        await updateLyrics(newLyrics);
        focusPrevious();
      } else if (!isFirstLine && isCursorAtStart && !isEmptyLine) {
        e.preventDefault();
        const previousLineLength = lyrics[focusedLine - 1].lyric.length;

        combineCurrentAndPrevious(newLyrics, target.value);
        deleteCurrent(newLyrics);
        await updateLyrics(newLyrics);
        focusPreviousAtEnd(previousLineLength);
      }
    }

    if (e.key === "Delete") {
      e.preventDefault();

      if (isEmptyLine) {
        deleteCurrent(newLyrics);
        await updateLyrics(newLyrics);

        if (lyrics.length === focusedLine) {
          focusPrevious();
        } else {
          focusCurrentStart();
        }
      } else if (!isLastLine && isCursorAtEnd) {
        combineNextAndCurrent(newLyrics, target.value);
        deleteNext(newLyrics);
        await updateLyrics(newLyrics);
        focusCurrentAtCursor();
      }
    }

    if (e.key === "Enter") {
      e.preventDefault();

      if (isCursorAtStart) {
        insertEmptyNext(newLyrics);
        replaceNext(newLyrics, target.value);
      } else if (isCursorBetween) {
        splitCurrent(newLyrics, target.value);
        replaceNext(newLyrics, target.value.substring(cursorPosition));
      } else {
        replaceNext(newLyrics, "");
      }

      await updateLyrics(newLyrics);
      focusNextStart();
    }

    if (e.key === "ArrowUp") {
      console.log("UP");
      if (isFocusedOnFirstLine) {
        e.preventDefault();
        dispatch("focusPrevious");
      } else if (!isFocusedOnFirstLine) {
        e.preventDefault();
        focusPreviousAtCursor();
      }
    }

    if (e.key === "ArrowLeft") {
      if (!isFocusedOnFirstLine && isCursorAtStart) {
        e.preventDefault();
        focusPrevious();
      }
    }

    if (e.key === "ArrowDown") {
      console.log("DOWN", focusedLine);
      if (isFocusedOnLastLine) {
        console.log("DOWN");
        e.preventDefault();

        dispatch("focusNext");
      } else if (!isFocusedOnLastLine) {
        e.preventDefault();

        focusNextAtCursor();
      }
    }

    if (e.key === "ArrowRight") {
      if (!isFocusedOnLastLine && isCursorAtEnd) {
        e.preventDefault();
        focusNext();
      }
    }
  };

  const handleLyricFocus = (_, lineIndex: number) => {
    focusedLine = lineIndex;
    dispatch("lineFocused");
  };

  const handleInput = (event) => {
    const target = event.target as HTMLInputElement;
    target.parentElement.dataset.value = target.value;

    section.lines[focusedLine].lyric = target.value;
  };

  // $: {
  //   if (focused && focusedLine !== undefined) {
  //     lineRefs[focusedLine].focus();
  //   }
  // }

  $: buttonsArr = [
    section.title,
    ...new Array(section.lines.length - 1).fill(""),
  ];
</script>

<div class="sketch__section">
  <div class="sketch__meta">
    {#each buttonsArr as line, index}
      {#if index === 0}
        <input class="sketch__section-title" bind:value={section.title} />
      {:else}
        <button
          class="sketch__add-section"
          on:click={() => handleNewSectionClick(index)}
        >
          <span class="btn-icon" aria-hidden="true">+</span>
          <span class="sr-only">Add section</span>
        </button>
      {/if}
    {/each}
  </div>
  <div class="sketch__lines">
    {#each section.lines as line, lineIndex}
      <div class="sketch__line" data-value={line.lyric}>
        <input
          bind:value={line.lyric}
          bind:this={lineRefs[lineIndex]}
          on:input={handleInput}
          on:keydown={handleLyricKeydown}
          on:focus={(_) => handleLyricFocus(_, lineIndex)}
        />
      </div>
    {/each}
  </div>
</div>

<style lang="scss">
  .sketch__section {
    display: grid;
    grid-template-columns: max-content 1fr;
    column-gap: 2rem;
    align-items: baseline;
    margin-bottom: 2rem;
    justify-items: start;

    &__title {
      margin: 0;
      text-transform: uppercase;
      font-size: 1.25rem;
    }
  }

  .sketch__section-title {
    text-align: right;
    border: none;
  }

  .sketch__add-section {
    background-color: transparent;
    padding: 0 0.5rem;
    justify-self: flex-end;
    opacity: 0;

    &:hover {
      background-color: #ddd;
      opacity: 1;
    }
  }

  .sketch__lines,
  .sketch__meta {
    display: grid;
    grid-auto-rows: 28px;
    row-gap: 1rem;
  }

  .sketch__lines {
    align-items: flex-start;
  }

  .sketch__line {
    display: inline-grid;
    input {
      border: none;
      &:focus {
        outline: none;
      }
    }

    &::after {
      content: attr(data-value) " ";
      visibility: hidden;
      white-space: pre-wrap;
    }
  }
</style>
