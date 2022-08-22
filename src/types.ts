export interface INode {
  data: string;
  position: number;
  duration: number;
}

export type TTrackType = "lyrics" | "chords" | "lead-vocal";
export interface ITrack {
  type: TTrackType;
  barLyric?: string;
  nodes: INode[];
}
export interface ISong {
  songTitle: string;
  tracks: ITrack[];
}

export type TDegree = "I" | "ii" | "iii" | "IV" | "V" | "vi" | "vii";

interface ISketchChord {
  position: number;
  data: string;
}

interface ISketchLine {
  lyric: string;
  chords: ISketchChord[];
}

interface ISketchSection {
  title: string;
  lines: ISketchLine[];
}

export interface ISongSketch {
  title: string;
  artist?: string;
  sections: ISketchSection[];
}
