<script lang="ts">
  import { tick } from "svelte";
  import type { ISongSketch } from "./types";

  let sketch: ISongSketch = {
    title: "Teenage Dirtbag",
    artist: "Wheatus",
    sections: [],
  };

  let lyrics = ["Her name is Noelle", "I have a dream about her"];

  let focusedLyric: number;
  let cursorPosition: number;

  const focusPrevious = () => {
    lineRefs[focusedLyric - 1].focus();
  };

  const focusNext = () => {
    lineRefs[focusedLyric + 1].focus();
  };

  const focusCurrentAtCursor = () => {
    lineRefs[focusedLyric].setSelectionRange(cursorPosition, cursorPosition);
  };

  const focusPreviousAtCursor = () => {
    lineRefs[focusedLyric - 1].setSelectionRange(
      cursorPosition,
      cursorPosition
    );
  };

  const focusNextAtCursor = () => {
    lineRefs[focusedLyric + 1].setSelectionRange(
      cursorPosition,
      cursorPosition
    );
  };

  const focusPreviousAtEnd = (index: number, previousEnd: number) => {
    lineRefs[index - 1].setSelectionRange(previousEnd, previousEnd);
  };

  const focusCurrentStart = (index: number) => {
    lineRefs[index].setSelectionRange(0, 0);
  };

  const focusNextStart = (index: number) => {
    lineRefs[index + 1].setSelectionRange(0, 0);
  };

  const deleteCurrent = (newLyrics: string[], index: number) => {
    newLyrics.splice(index, 1);
  };

  const deleteNext = (newLyrics: string[], index: number) => {
    newLyrics.splice(index + 1, 1);
  };

  const splitCurrent = (
    newLyrics: string[],
    index: number,
    current: string
  ) => {
    newLyrics.splice(index, 1, current.substring(0, cursorPosition));
  };

  const combineCurrentAndPrevious = (
    newLyrics: string[],
    index: number,
    currentLyric: string
  ) => {
    newLyrics.splice(index - 1, 1, lyrics[index - 1] + currentLyric);
  };

  const combineNextAndCurrent = (
    newLyrics: string[],
    index: number,
    currentLyric: string
  ) => {
    newLyrics.splice(index, 1, currentLyric + lyrics[index + 1]);
  };

  const insertEmptyNext = (newLyrics: string[], index: number) => {
    newLyrics.splice(index, 1, "");
  };

  const replaceNext = (newLyrics: string[], index: number, content: string) => {
    newLyrics.splice(index + 1, 0, content);
  };

  const updateLyrics = async (newLyrics: string[]) => {
    lyrics = newLyrics;
    await tick();
  };

  const handleLyricKeydown = async (e: KeyboardEvent, index: number) => {
    const target = e.target as HTMLInputElement;
    cursorPosition = target.selectionStart;

    const isEmptyLine = target.value.length === 0;
    const isFirstLine = index === 0;
    const isLastLine = index === lyrics.length - 1;
    const isFocusedOnFirstLine = focusedLyric === 0;
    const isFocusedOnLastLine = focusedLyric + 1 === lyrics.length;
    const isCursorAtStart = cursorPosition === 0;
    const isCursorAtEnd = cursorPosition === target.value.length;
    const isCursorBetween =
      cursorPosition > 0 && cursorPosition < target.value.length - 1;
    const newLyrics = [...lyrics];

    if (e.key === "Backspace") {
      if (isEmptyLine) {
        e.preventDefault();

        deleteCurrent(newLyrics, index);
        await updateLyrics(newLyrics);
        focusPrevious();
      } else if (!isFirstLine && isCursorAtStart) {
        const previousLineLength = lyrics[index - 1].length;
        e.preventDefault();

        combineCurrentAndPrevious(newLyrics, index, target.value);
        deleteCurrent(newLyrics, index);
        await updateLyrics(newLyrics);
        focusPreviousAtEnd(index, previousLineLength);
      }
    }

    if (e.key === "Delete") {
      e.preventDefault();
      if (isEmptyLine) {
        deleteCurrent(newLyrics, index);
        await updateLyrics(newLyrics);

        if (lyrics.length === index) {
          focusPrevious();
        } else {
          focusCurrentStart(index);
        }
      } else if (!isLastLine && isCursorAtEnd) {
        combineNextAndCurrent(newLyrics, index, target.value);
        deleteNext(newLyrics, index);
        await updateLyrics(newLyrics);
        focusCurrentAtCursor();
      }
    }

    if (e.key === "Enter") {
      if (isCursorAtStart) {
        insertEmptyNext(newLyrics, index);
        replaceNext(newLyrics, index, target.value);
      } else if (isCursorBetween) {
        splitCurrent(newLyrics, index, target.value);
        replaceNext(newLyrics, index, target.value.substring(cursorPosition));
      } else {
        replaceNext(newLyrics, index, "");
      }

      await updateLyrics(newLyrics);
      focusNextStart(index);
    }

    if (e.key === "ArrowUp") {
      if (!isFocusedOnFirstLine) {
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
      if (!isFocusedOnLastLine) {
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

  const handleLyricFocus = (e: FocusEvent, index: number) => {
    focusedLyric = index;
  };

  const handleInput = (event) => {
    const target = event.target as HTMLInputElement;
    target.parentElement.dataset.value = target.value;
  };

  let showChords = true;

  let lineRefs = [];
</script>

<div class="sketch-container">
  <div class="sketch">
    {#each lyrics as lyric, lyricIndex}
      <div class="sketch__lyric" data-value={lyric}>
        <input
          bind:value={lyric}
          bind:this={lineRefs[lyricIndex]}
          on:input={handleInput}
          on:keydown={(e) => handleLyricKeydown(e, lyricIndex)}
          on:focus={(e) => handleLyricFocus(e, lyricIndex)}
        />
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
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .sketch__lyric {
    display: inline-grid;

    &::after {
      content: attr(data-value) " ";
      visibility: hidden;
      white-space: pre-wrap;
    }
  }
</style>
