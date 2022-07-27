import { Note } from "@tonaljs/tonal";
import { WHOLE_NOTE_TICKS } from "../constants/midi";

const durationMap = {
  1: 384,
  2: 192,
  4: 96,
  8: 48,
  16: 24,
  32: 12,
};

interface IAddNote {
  note: string;
  noteType: 1 | 2 | 4 | 8 | 16 | 32;
}

export function addNote(obj: IAddNote) {
  const duration = WHOLE_NOTE_TICKS / obj.noteType;
  const note = Note.midi(obj.note);

  return [
    {
      channel: 0,
      delta: 0,
      noteOn: {
        noteNumber: note,
        velocity: 100,
      },
    },
    {
      channel: 0,
      delta: duration,
      noteOff: {
        noteNumber: note,
        velocity: 100,
      },
    },
  ];
}
