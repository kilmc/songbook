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

const storedSong =
	browser && localStorage.getItem('song')
		? JSON.parse(localStorage.getItem('song') || '')
		: defaultSong;

export const song = writable<ISong>(storedSong);

if (browser) {
	song.subscribe((value) => {
		localStorage.setItem('song', JSON.stringify(value));
	});
}
