export type TSong = string;

export interface ISongMeta {
	title: string;
	artist: string;
	key: string;
}

export interface IChord {
	data: string;
	position: number;
}

export interface IChordLine {
	type: 'chord';
	chords?: IChord[];
}

export interface ILyricLine {
	type: 'lyric';
	data: string;
}

export interface IEmptyLine {
	type: 'empty';
}

export interface ISongSection {
	title: string;
	lines: (IChordLine | ILyricLine | IEmptyLine)[];
}

export interface ISong {
	meta: ISongMeta;
	sections: ISongSection[];
	src: string;
}
