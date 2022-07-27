<script lang="ts">
  import { encode } from 'json-midi-encoder';
  import { saveAs } from 'file-saver';
  import { addNote } from "./midi/addNote";
  import PianoRoll from "./PianoRoll.svelte";

  const timeSignature = {
    "delta": 0,
    "timeSignature": {
      "denominator": 4,
      "metronome": 24,
      "numerator": 4,
      "thirtyseconds": 8
    }
  };

  const line1 = {
    division: 96,
    format: 1,
    tracks: [
      [
        ...addNote({ note: "G#3", noteType: 8 }),
        ...addNote({ note: "A3", noteType: 8 }),
        ...addNote({ note: "B3", noteType: 8 }),
        ...addNote({ note: "D#4", noteType: 8 }),
      ],
    ],
  };

  function saveData() {
    encode(line1).then((midiFile) => {
      saveAs(new Blob([midiFile],{type: "example/binary"}),"line1.mid");
    });
  }

</script>
<div class="midi-input">
  <button class="save-button" on:click={() => saveData()}>Save</button>
  <div>
    <PianoRoll octave={4} />
    <PianoRoll octave={3} />
  </div>
</div>

<style>
  .midi-input {
    background-color: #8b8b8b;
    display: grid;
  }

  .save-button {
    margin: 1rem;
  }
</style>