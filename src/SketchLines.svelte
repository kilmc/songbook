<script lang="ts">
  import { tick } from "svelte";
  import type { ISketchLine, ISketchSection } from "./types";

  export let section: ISketchSection;

  let focusedLine: number = 0;
  let cursorPosition: number;

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
    e.preventDefault();
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
        deleteCurrent(newLyrics);
        await updateLyrics(newLyrics);
        focusPrevious();
      } else if (!isFirstLine && isCursorAtStart) {
        const previousLineLength = lyrics[focusedLine - 1].lyric.length;

        combineCurrentAndPrevious(newLyrics, target.value);
        deleteCurrent(newLyrics);
        await updateLyrics(newLyrics);
        focusPreviousAtEnd(previousLineLength);
      }
    }

    if (e.key === "Delete") {
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
      if (!isFocusedOnFirstLine) {
        focusPreviousAtCursor();
      }
    }

    if (e.key === "ArrowLeft") {
      if (!isFocusedOnFirstLine && isCursorAtStart) {
        focusPrevious();
      }
    }

    if (e.key === "ArrowDown") {
      if (!isFocusedOnLastLine) {
        focusNextAtCursor();
      }
    }

    if (e.key === "ArrowRight") {
      if (!isFocusedOnLastLine && isCursorAtEnd) {
        focusNext();
      }
    }
  };

  const handleLyricFocus = (_, lineIndex: number) => {
    focusedLine = lineIndex;
  };

  const handleInput = (event) => {
    const target = event.target as HTMLInputElement;
    target.parentElement.dataset.value = target.value;

    section.lines[focusedLine].lyric = target.value;
  };

  let lineRefs = [];
</script>

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

<style lang="scss">
  .sketch__lines {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .sketch__line {
    display: inline-grid;

    &::after {
      content: attr(data-value) " ";
      visibility: hidden;
      white-space: pre-wrap;
    }
  }
</style>
