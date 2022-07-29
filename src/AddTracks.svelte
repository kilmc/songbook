<script lang="ts">
  import { song } from "./stores/songStore";
  import merge from 'lodash.merge';
  import type { TTrackType } from "./types";

  const addTrack = (type: TTrackType) => {
    song.set(merge($song, {
      tracks: [...$song.tracks, { type: type, nodes: []}]
    }));
  };
</script>

<div>
  <button class="btn mb1" on:click={() => addTrack("chords")}>Add chords</button>
  <button class="btn mb1" on:click={() => addTrack("lyrics")}>Add lyrics</button>
  <button class="btn mb1" on:click={() => addTrack("lead-vocal")}>Add vocal melody</button>
</div>