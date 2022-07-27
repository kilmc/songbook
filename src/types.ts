export interface ISong {
  songTitle: string;
  artist: string;
  measures: IMeasure[];
}
export interface IMeasure {
  chords?: IChord[];
  lyrics?: ILyric;
}
export interface IChord {
  name: string;
  notes?: string[];
  duration: string;
  position: string;
  degree?: TDegree;
}
export interface ILyric {
  text: string;
  segments: ISegment[];
}
export interface ISegment {
  text: string;
  position: string;
}

export type TDegree = "I" | "ii" | "iii" | "IV" | "V" | "vi" | "vii";
