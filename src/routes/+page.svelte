<script lang="ts">
	import { song } from '$lib/stores/songStore';
	import type { IChord, IChordLine, IEmptyLine, ILyricLine, ISong, ISongSection } from '$lib/types';
	import SongInfoItem from './SongInfoItem.svelte';

	const sectionIndicator = '---';
	const chordIndicator = '@@@';
	let isEditing = false;

	type TLineType = 'section' | 'chord' | 'lyric' | 'empty';

	const determineLineType = (line: string): TLineType => {
		const isSectionLine = new RegExp(`${sectionIndicator}$`).test(line);
		const isChordLine = new RegExp(`${chordIndicator}$`).test(line);

		if (isSectionLine) {
			return 'section';
		}

		if (isChordLine) {
			return 'chord';
		}

		if (line.length === 0) {
			return 'empty';
		}

		return 'lyric';
	};

	const stringToChord = (line: string) => {
		const chordRegExp = new RegExp(/(^|\s+|$)?((?:[A-G])(?:#|b)?(?:m)?(?:sus)?(?:\d)?)/, 'g');
		return line
			.split(chordRegExp)
			.filter((part) => {
				if (part === undefined) {
					return true;
				}
				return part.length !== 0;
			})
			.map((linePart) => {
				return linePart === undefined ? '' : linePart;
			});
	};

	const stringToChords = (line: string): IChord[] | undefined => {
		const chordRegExp = new RegExp(/(^|\s+|$)?((?:[A-G])(?:#|b)?(?:m)?(?:sus)?(?:\d)?)/, 'g');
		const chordGroups = line
			.replace(chordIndicator, '')
			.match(chordRegExp)
			?.map((item) => {
				return stringToChord(item);
			});

		if (chordGroups) {
			return chordGroups.map((chordGroup) => {
				const [gap, chord] = chordGroup;

				return {
					data: chord,
					position: gap.length
				};
			});
		}
	};

	const buildChordLine = (line: IChordLine) => {
		return line.chords
			?.map((chord) => {
				return `<span class="inline-block relative font-bold" style="left: ${chord.position}ch">${chord.data}</span>`;
			})
			.join('');
	};

	const parse = (sections: ISongSection[]) => {
		const builtSections = sections.map((section) => {
			const titleTag = `<h2 class="font-bold">${section.title}</h2>`;
			const lines = section.lines
				.map((line) => {
					switch (line.type) {
						case 'chord':
							return buildChordLine(line);
						case 'lyric':
							return `<div>${line.data}<br></div>`;
						default:
							return `<div><br></div>`;
					}
				})
				.join('');

			return `<div class="song__section">${titleTag}<div>${lines}</div></div>`;
		});

		return builtSections.join('');
	};

	const toggleEditor = () => (isEditing = !isEditing);

	const handleKeydown = (event: KeyboardEvent) => {
		event.key === 'e' && event.metaKey === true && toggleEditor();
	};

	const stringToLine = (line: string): ILyricLine | IChordLine | IEmptyLine => {
		const type = determineLineType(line);
		if (type === 'chord') {
			return {
				type: 'chord',
				chords: stringToChords(line)
			};
		} else if (type === 'lyric') {
			return {
				type: 'lyric',
				data: line
			};
		} else {
			return {
				type: 'empty'
			};
		}
	};

	const srcToSections = (src: string) => {
		const lines = src.split('\n');
		const sectionRanges = lines
			.map((line, i) => {
				return line.includes(sectionIndicator) ? i : -1;
			})
			.filter((line) => line >= 0);

		const sections = sectionRanges.map((rangeStart, i) => {
			if (sectionRanges[i + 1]) {
				return lines.slice(rangeStart, sectionRanges[i + 1]);
			} else {
				return lines.slice(rangeStart, lines.length);
			}
		});

		const buildSections = (section: string[]): ISongSection => {
			const [sectionTitle, ...lines] = section;

			return {
				title: sectionTitle.replace(sectionIndicator, '').trim(),
				lines: lines.map(stringToLine)
			};
		};

		return sections.map(buildSections);
	};

	const handleOnChange = (e: Event) => {
		if (!(e.target instanceof HTMLTextAreaElement)) return;

		$song.src = e.target.value;
		$song.sections = srcToSections(e.target.value);
	};
</script>

<svelte:head>
	<title>Songbook</title>
</svelte:head>
<svelte:window on:keydown={handleKeydown} />
<div class="layout--song h-full">
	<aside class="bg-slate-900 p-10">
		<SongInfoItem label="Title" bind:value={$song.meta.title} />
		<SongInfoItem label="Artist" bind:value={$song.meta.artist} />
		<SongInfoItem label="Key" bind:value={$song.meta.key} />
	</aside>

	<div class="font-mono bg-slate-800 p-10">
		{#if isEditing}
			<div class="w-full h-[80vh]">
				<textarea
					class="w-full h-full bg-slate-800"
					value={$song.src}
					on:change={handleOnChange}
					on:blur={toggleEditor}
				/>
			</div>
		{:else}
			<div class="w-full whitespace-pre" on:click={toggleEditor}>
				{@html parse($song.sections)}
			</div>
		{/if}
	</div>
</div>

<style>
	.layout--song {
		display: grid;
		grid-template-columns: max-content 1fr;
	}
</style>
