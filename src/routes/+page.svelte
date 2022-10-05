<script lang="ts">
	import { song } from '$lib/stores/songStore';
	import SongInfoItem from './SongInfoItem.svelte';

	const sectionIndicator = '---';
	const chordIndicator = '@@@';
	let isEditing = false;

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

	const toggleEditor = () => (isEditing = !isEditing);

	const handleKeydown = (event: KeyboardEvent) => {
		event.key === 'e' && event.metaKey === true && toggleEditor();
	};
</script>

<svelte:head>
	<title>Songbook</title>
</svelte:head>
<svelte:window on:keydown={handleKeydown} />
<div class="layout--song h-full">
	<aside class="bg-slate-900 p-10">
		<SongInfoItem label="Title" value="Teenage Dirtbag" />
		<SongInfoItem label="Artist" value="Wheatus" />
		<SongInfoItem label="Key" value="E Major" />
	</aside>
	<div class="font-mono bg-slate-800 p-10">
		{#if isEditing}
			<div class="w-full h-[80vh]">
				<textarea class="w-full h-full bg-slate-800" bind:value={$song} on:blur={toggleEditor} />
			</div>
		{:else}
			<div class="w-full whitespace-pre" on:click={toggleEditor}>
				{@html parse($song)}
			</div>
		{/if}
	</div>
</div>

<style>
	.layout--song {
		display: grid;
		grid-template-columns: max-content 1fr;
	}

	.sketch {
		font-family: monospace;
		font-size: 1.6em;
	}
</style>
