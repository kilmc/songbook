<script lang="ts">
  import type { IChord } from "./types";
  
  function getChordPosition(chord: IChord) {
    const [beatPosition] = chord.position.split('.').map(parseInt)
    const rowStyle = "grid-row: 1;";
    const columnStyle = `grid-column: ${beatPosition + 1};`

    return `${rowStyle} ${columnStyle}`
  }

  export let chord: IChord;  
</script>

<div class="chord" style={getChordPosition(chord)}>{chord.name}</div>