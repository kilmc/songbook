<script lang="ts">
  import { song } from '$lib/stores/songStore';




	const sectionIndicator = '---';
	const chordIndicator = '@@@';
  let isEditing = true;

	type TLineType = 'section' | 'chord' | 'lyric';

	const determineLineType = (line: string): TLineType => {
		const isSectionLine = new RegExp(`${sectionIndicator}$`).test(line);
		const isChordLine = new RegExp(`${chordIndicator}$`).test(line);

		if (isSectionLine) {
			return 'section';
		}

		if (isChordLine) {
			return 'chord';
		}

		return 'lyric';
	};

	const parse = (song: string) => {
		return song
			.split('\n')
			.map((line) => {
				switch (determineLineType(line)) {
					case 'section':
						return `<div class="font-bold">${line.replace(sectionIndicator, '')}</div>`;
					case 'chord':
						return `<div>${line.replace(chordIndicator, '')}</div>`;
					case 'lyric':
						return `<div>${line}<br></div>`;
					default:
            return `<div><br></div>`;
				}
			})
			.join('');
	};

  const toggleEditor = () => isEditing = !isEditing;

  const handleKeydown = (event) => {
    event.key === "e" && event.metaKey === true && toggleEditor();
  } 
</script>

<svelte:head>
	<title>Songbook</title>
</svelte:head>
<svelte:window on:keydown={handleKeydown}/>

<div class="sketch-container font-mono">
  <button on:click={toggleEditor}>pencilIcon</button>
  {#if isEditing}
    <div class="input">
      <textarea bind:value={$song} on:blur={toggleEditor}/>
    </div>
  {:else}
    <div class="output whitespace-pre" on:click={toggleEditor}>
      {@html parse($song)}
    </div>
  {/if}
</div>

<style>
	.sketch-container {
		display: flex;
		flex-direction: column;
		margin: 4rem auto;
	}

	.sketch {
		font-family: monospace;
		font-size: 1.6em;
	}
</style>
