<script lang="ts">
	import { song } from '$lib/stores/songStore';
  import type { IChord, IChordLine, IEmptyLine, ILyricLine, ISong, ISongSection } from '$lib/types';
	import type { PageData } from './$types';
  import SongInfoItem from './SongInfoItem.svelte';
	
  export let data: PageData;

  let isEditing = false;
	const toggleEditor = () => (isEditing = !isEditing);

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

	const handleKeydown = (event: KeyboardEvent) => {
		event.key === 'e' && event.metaKey === true && toggleEditor();
	};

	const handleOnChange = (e: Event) => {
	};

  console.log(data)
</script>

<svelte:head>
	<title>Songbook</title>
</svelte:head>
<svelte:window on:keydown={handleKeydown} />
<div class="layout--song h-full">
	<aside class="bg-slate-900 p-10">
		<SongInfoItem label="Title" bind:value={data.meta.title} />
		<SongInfoItem label="Artist" bind:value={data.meta.artist} />
		<SongInfoItem label="Key" bind:value={data.meta.key} />
	</aside>

	<div class="font-mono bg-slate-800 p-10">
		{#if isEditing}
			<div class="w-full h-[80vh]">
				<textarea
					class="w-full h-full bg-slate-800"
					value={data.src}
					on:change={handleOnChange}
					on:blur={toggleEditor}
				/>
			</div>
		{:else}
			<div class="w-full whitespace-pre" on:click={toggleEditor}>
				{@html parse(data.sections)}
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
