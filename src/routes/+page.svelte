<script lang="ts">
	let song = `Verse 1 ---
E           A@@@
Her name is Noelle`;

	const sectionIndicator = '---';
	const chordIndicator = '@@@';

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
						return `<div>${line}</div>`;
					default:
						break;
				}
			})
			.join('');
	};
</script>

<svelte:head>
	<title>Songbook</title>
</svelte:head>

<div class="sketch-container font-mono">
	<div class="input">
		<textarea bind:value={song} />
	</div>

	<div class="output whitespace-pre">
		{@html parse(song)}
	</div>
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
