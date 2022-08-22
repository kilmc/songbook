<script>
  import { createEventDispatcher, onMount } from "svelte";

  export let value;
  let original;
  let editing = false;

  const dispatch = createEventDispatcher();

  onMount(() => {
    original = value;
  });

  function edit() {
    editing = true;
  }

  function submit() {
    if (original !== undefined && value !== original) {
      dispatch("submit", value);
    }

    editing = false;
  }

  function keydown(event) {
    if (event.key === "Escape") {
      event.preventDefault();
      value = original;
      editing = false;
    }
  }

  function focus(element) {
    element.focus();
  }
</script>

{#if editing}
  <form
    class="edit-in-place"
    on:submit|preventDefault={submit}
    on:keydown={keydown}
  >
    <input bind:value on:blur={submit} use:focus />
  </form>
{:else}
  <div class="edit-in-place" on:click={edit}>
    {value}
  </div>
{/if}

<style lang="scss">
  .edit-in-place {
    background-color: #ddd;
    color: #000;
    width: 100%;
    font-size: 1.6rem;
    height: 100%;
    font-weight: normal;

    input {
      font-size: 1.6rem;
      outline: none;
      margin: 0;
      padding: 0;
      border: none;
      height: 100%;
      font-weight: normal;
      width: 100%;
    }
  }
</style>
