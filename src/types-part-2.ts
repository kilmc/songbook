export interface INode {
  position: number;
  duration: number;
  data: string;
}

export interface IVocalMelodyNode extends INode {
  lyricSlice: string;
}

export interface ILeadVocalTrack {
  lyric: string;
  melodyNodes?: IVocalMelodyNode[];
}

export interface IChordNode extends INode {
  rhythmNodes?: INode[];
  charIndex?: number;
}

export interface ISongSegment {
  position: number;
  duration: number;
  chords?: IChordNode[];
  leadVocal?: ILeadVocalTrack;
}

export interface ISong {
  songTitle: string;
  segments: ISongSegment[];
}
