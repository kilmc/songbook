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
  type IMoveMap = {
    [k in TMoves]: number;
  };
  const generateMoveMap = (): IMoveMap => ({
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
    const moveMap = generateMoveMap();
    const hasPrevious = section.lines[moveMap["previous"]] !== undefined;
    const previousEnd = hasPrevious
      ? section.lines[moveMap["previous"]].lyric.length
      : 0;

    const positionMap: { [k in TCursorPosition]: number } = {
      start: 0,
      current: cursorPosition,
      end: previousEnd,
    };

    const newPosition = posOverride ? posOverride : positionMap[position];
    lineRefs[moveMap[move]].setSelectionRange(newPosition, newPosition);
  };

  type TLyricActions = "delete" | "insert" | "replace" | "split" | "combine";

  const actionMap: { [k in TLyricActions]: number } = {
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

  const generateItemsMap = (lyric: string, moveMap: IMoveMap, move: TMoves) => {
    return {
      empty: "",
      replace: lyric,
      split: Boolean(lyric) ? lyric.substring(0, cursorPosition) : "",
      combine: () => {
        const moveLyric = section.lines[moveMap[move]].lyric;
        return move === "previous"
          ? `${moveLyric}${lyric}`
          : `${lyric}${moveLyric}`;
      },
    };
  };

  const modifyLines = (
    action: TLyricActions,
    move: TMoves,
    newLines: ISketchLine[],
    lyric?: string
  ) => {
    const moveMap = generateMoveMap();
    const itemsMap = generateItemsMap(lyric, moveMap, move);

    if (
      (!Boolean(lyric) && action === "insert") ||
      (!Boolean(lyric) && action === "replace")
    ) {
      newLines.splice(
        moveMap[move],
        actionMap[action],
        buildLine(itemsMap["empty"])
      );
    } else if (action === "combine") {
      const newMove = move === "next" ? "current" : move;
      newLines.splice(
        moveMap[newMove],
        actionMap[action],
        buildLine(itemsMap[action]())
      );
    } else if (action === "delete") {
      newLines.splice(moveMap[move], actionMap[action]);
    } else {
      newLines.splice(
        moveMap[move],
        actionMap[action],
        buildLine(itemsMap[action])
      );
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
        modifyLines("delete", "next", newLyrics);
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

        modifyLines("combine", "previous", newLyrics, target.value);
        modifyLines("delete", "current", newLyrics);
        await updateLyrics(newLyrics);
        focusAtCursor("previous", "end", previousLineLength);
      }
    }

    if (e.key === "Delete") {
      if (emptyLine && !lastLine) {
        e.preventDefault();
        modifyLines("delete", "current", newLyrics);
        await updateLyrics(newLyrics);

        if (lyrics.length === focusedLine) {
          focusAtCursor("previous", "end");
        } else {
          focusAtCursor("current", "start");
        }
      } else if (!lastLine && cursorAtEnd) {
        e.preventDefault();

        modifyLines("combine", "next", newLyrics, target.value);
        modifyLines("delete", "next", newLyrics);
        await updateLyrics(newLyrics);
        focusAtCursor("current", "current");
      }
    }

    if (e.key === "Enter") {
      e.preventDefault();

      if (cursorAtStart) {
        modifyLines("insert", "next", newLyrics);
        modifyLines("replace", "next", newLyrics, target.value);
      } else if (cursorBetween) {
        modifyLines("split", "current", newLyrics, target.value);
        modifyLines(
          "replace",
          "next",
          newLyrics,
          target.value.substring(cursorPosition)
        );
      } else {
        modifyLines("replace", "next", newLyrics);
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
