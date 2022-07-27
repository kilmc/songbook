<script lang="ts">
  export let pitch = "A";
  export let octave = 3;
  export let gridWidth = 8;

  function toggleSelectedIndex(index) {
    selectedIndexes = selectedIndexes.includes(index) 
      ? selectedIndexes.filter(x => x !== index)
      : selectedIndexes.concat(index).sort();
  }

  $: selectedIndexes = [];
  $: blackOrWhiteKey = /#|b/.test(pitch) ? "key--black" : "key--white";
  $: note = `${pitch}${octave}`

</script>

<div class="piano-line">
  <button class={`key ${blackOrWhiteKey}`}>{note}</button>
  <div class="note-grid">
    {#each Array(gridWidth) as _, i}
      <div
        class="note"
        class:note--selected={selectedIndexes.includes(i)} 
        on:click={() => toggleSelectedIndex(i) }
      >
        {selectedIndexes.includes(i) ? note : " "}
      </div>
    {/each}
  </div>
</div>

<style lang="scss">
  .piano-line {
    display: grid;
    grid-template-columns: 3rem 1fr;
  }

  .key {
    background-color: transparent;
    border: none;
    padding: 0;
    margin: 0;

    &--white {
      background-color: #fff;
    }

    &--black {
      background-color: #000;
      color: #fff;
    }
  }

  .note-grid {
    display: flex;
    align-items: flex-start;
    width: 100%;
    height: 1.25rem;
    box-sizing: border-box;

    &:hover {
      background-color: #bbbbbb;
    }
  }

  .note {
    flex: 1;
    border-bottom: 1px solid black;
    border-right: 1px solid grey;
    height: 100%;
    text-align: center;

    &:nth-of-type(4n) {
      border-right: 1px solid black;
    }

    &--selected {
      background-color: hotpink;
    }
  }
</style>