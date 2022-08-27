<script lang="ts">
  import { tick, createEventDispatcher } from "svelte";
  import type { ISketchLine, ISketchSection } from "./types";

  export let section: ISketchSection;
  export let focused: boolean;
  export let focusedLine: number | undefined;
  export let cursorPosition: number;

  let lineRefs = [];

  const dispatch = createEventDispatcher();

  const handleNewSectionClick = (lineIndex: number) => {
    dispatch("new", { lineIndex });
  };

  type TMoves = "next" | "current" | "previous";
  type Imoves = {
    [k in TMoves]: number;
  };
  const generatemoves = (): Imoves => ({
    next: focusedLine + 1,
    current: focusedLine,
    previous: focusedLine - 1,
  });

  type TCursorPosition = "start" | "current" | "end";

  const focusAtCursor = (
    move: TMoves,
    position: TCursorPosition,
    posOverride?: number
  ) => {
    const moves = generatemoves();
    const hasPrevious = section.lines[moves["previous"]] !== undefined;
    const previousEnd = hasPrevious
      ? section.lines[moves["previous"]].lyric.length
      : 0;

    const positionMap: { [k in TCursorPosition]: number } = {
      start: 0,
      current: cursorPosition,
      end: previousEnd,
    };

    const newPosition = posOverride ? posOverride : positionMap[position];
    lineRefs[moves[move]].setSelectionRange(newPosition, newPosition);
  };

  type TLyricActions = "delete" | "insert" | "replace" | "split" | "combine";

  const actions: { [k in TLyricActions]: number } = {
    delete: 1,
    insert: 1,
    replace: 0,
    split: 1,
    combine: 1,
  };

  const buildLine = (lyric) => ({
    lyric,
    chords: "",
  });

  const generateLyrics = (lyric: string, moves: Imoves, move: TMoves) => {
    return {
      empty: buildLine(""),
      replace: buildLine(lyric),
      split: buildLine(
        Boolean(lyric) ? lyric.substring(0, cursorPosition) : ""
      ),
      combine: () => {
        const moveLyric = section.lines[moves[move]].lyric;
        return buildLine(
          move === "previous" ? `${moveLyric}${lyric}` : `${lyric}${moveLyric}`
        );
      },
    };
  };

  const modifyLyrics = (
    action: TLyricActions,
    move: TMoves,
    newLines: ISketchLine[],
    lyric?: string
  ) => {
    const moves = generatemoves();
    const lyrics = generateLyrics(lyric, moves, move);

    if (!Boolean(lyric) && (action === "insert" || action === "replace")) {
      newLines.splice(moves[move], actions[action], lyrics["empty"]);
    } else if (action === "combine") {
      const newMove = move === "next" ? "current" : move;
      newLines.splice(moves[newMove], actions[action], lyrics[action]());
    } else if (action === "delete") {
      newLines.splice(moves[move], actions[action]);
    } else {
      newLines.splice(moves[move], actions[action], lyrics[action]);
    }
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

    const emptyLine = target.value.length === 0;
    const firstLine = focusedLine === 0;
    const lastLine = focusedLine === lyrics.length - 1;
    const onlyLine = lyrics.length === 1;
    const focusedOnFirstLine = focusedLine === 0;
    const focusedOnLastLine = focusedLine + 1 === lyrics.length;
    const cursorAtStart = cursorPosition === 0;
    const cursorAtEnd = cursorPosition === target.value.length;
    const cursorBetween =
      cursorPosition > 0 && cursorPosition < target.value.length - 1;
    const lineFullySelected =
      target.selectionStart === 0 &&
      target.selectionEnd === target.value.length;

    if (e.key === "Backspace") {
      if (emptyLine && onlyLine && cursorAtStart) {
        dispatch("delete");
      } else if (emptyLine) {
        e.preventDefault();
        modifyLyrics("delete", "next", newLyrics);
        await updateLyrics(newLyrics);
        focusAtCursor("previous", "end");
      } else if (
        !lineFullySelected &&
        !firstLine &&
        cursorAtStart &&
        !emptyLine
      ) {
        e.preventDefault();
        const previousLineLength = lyrics[focusedLine - 1].lyric.length;

        modifyLyrics("combine", "previous", newLyrics, target.value);
        modifyLyrics("delete", "current", newLyrics);
        await updateLyrics(newLyrics);
        focusAtCursor("previous", "end", previousLineLength);
      }
    }

    if (e.key === "Delete") {
      if (emptyLine && !lastLine) {
        e.preventDefault();
        modifyLyrics("delete", "current", newLyrics);
        await updateLyrics(newLyrics);

        if (lyrics.length === focusedLine) {
          focusAtCursor("previous", "end");
        } else {
          focusAtCursor("current", "start");
        }
      } else if (!lastLine && cursorAtEnd) {
        e.preventDefault();

        modifyLyrics("combine", "next", newLyrics, target.value);
        modifyLyrics("delete", "next", newLyrics);
        await updateLyrics(newLyrics);
        focusAtCursor("current", "current");
      }
    }

    if (e.key === "Enter") {
      e.preventDefault();

      if (cursorAtStart) {
        modifyLyrics("insert", "next", newLyrics);
        modifyLyrics("replace", "next", newLyrics, target.value);
      } else if (cursorBetween) {
        modifyLyrics("split", "current", newLyrics, target.value);
        modifyLyrics(
          "replace",
          "next",
          newLyrics,
          target.value.substring(cursorPosition)
        );
      } else {
        modifyLyrics("replace", "next", newLyrics);
      }

      await updateLyrics(newLyrics);
      focusAtCursor("next", "start");
    }

    if (e.key === "ArrowUp") {
      if (focusedOnFirstLine) {
        e.preventDefault();
        dispatch("focusPrevious", { cursorPosition });
      } else if (!focusedOnFirstLine) {
        e.preventDefault();
        focusAtCursor("previous", "current");
      }
    }

    if (e.key === "ArrowLeft") {
      if (!focusedOnFirstLine && cursorAtStart) {
        e.preventDefault();
        focusAtCursor("previous", "end");
      }
    }

    if (e.key === "ArrowDown") {
      if (focusedOnLastLine) {
        e.preventDefault();

        dispatch("focusNext", { cursorPosition });
      } else if (!focusedOnLastLine) {
        e.preventDefault();
        focusAtCursor("next", "current");
      }
    }

    if (e.key === "ArrowRight") {
      if (!focusedOnLastLine && cursorAtEnd) {
        e.preventDefault();
        focusAtCursor("next", "start");
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

  $: onSectionFocusChange(focused);

  function onSectionFocusChange(xFocused) {
    if (xFocused && focusedLine !== undefined) {
      lineRefs[focusedLine].setSelectionRange(cursorPosition, cursorPosition);
    }
  }

  $: buttonsArr = [
    section.title,
    ...new Array(section.lines.length > 0 ? section.lines.length - 1 : 1).fill(
      ""
    ),
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
        <!-- <input class="sketch__line__chord" bind:value={line.chords} /> -->
        <input
          bind:value={line.lyric}
          bind:this={lineRefs[lineIndex]}
          on:input={handleInput}
          on:keydown={handleLyricKeydown}
          on:focus={(_) => handleLyricFocus(_, lineIndex)}
          class="sketch__line__lyric"
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

    &:focus {
      outline: none;
    }
  }

  .sketch__add-section {
    background-color: transparent;
    padding: 0 0.5rem;
    justify-self: flex-end;
    opacity: 0;
    transition: opacity 0.1s ease-in;

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

  .sketch__line__chord {
    background-color: #eee;
  }
</style>
