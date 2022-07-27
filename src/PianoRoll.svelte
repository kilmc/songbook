<script>
  import PianoLine from "./PianoLine.svelte";
  
  export let octave = 3;
  let notes = ["B","A#","A","G#","G","F#","F","E","D#","D","C#","C"]
</script>

{#each notes as note}
  <PianoLine pitch={note} octave={octave}/>  
{/each}