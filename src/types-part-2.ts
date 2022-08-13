interface INode {
  position: number;
  duration: number;
  data: string;
}

interface IVocalMelodyNode extends INode {
  lyricSlice: string;
}

interface ILeadVocalTrack {
  lyric: string;
  melodyNodes: IVocalMelodyNode[];
}

interface IChordNode extends INode {
  rhtyhmNodes: INode[];
}

interface ISongSegment {
  position: number;
  duration: number;
  chords?: IChordNode[];
  leadVocal?: ILeadVocalTrack;
}

interface ISong {
  segments: ISongSegment[];
}
