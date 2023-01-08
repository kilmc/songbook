import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import type { ISong, TSong } from '../types';


const dirtbag: TSong = `Verse 1 ---
E           A@@@
Her name is Noelle`;

const defaultSong: ISong = {
	meta: {
		title: 'Teenage Dirtbag',
		artist: 'Wheatus',
		key: 'E major'
	},
	sections: [
		{
			title: 'Verse 1',
			lines: [
				{
					type: 'chord',
					chords: [
						{ data: 'E', position: 0 },
						{ data: 'A', position: 13 }
					]
				},
				{
					type: 'lyric',
					data: 'Her name is Noelle'
				}
			]
		}
	],
	src: dirtbag
};



export const song = writable<ISong>();
