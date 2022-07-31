import { Note } from "@tonaljs/tonal";
import type { INode } from "../types";

const sortNotes = (a: string, b: string) => {
  return Note.midi(b) - Note.midi(a);
};

export type TRowDisplayValue = "single" | "notes";

interface IRowDsiplay {
  name: string;
  value: TRowDisplayValue;
  rowMap?: string[];
}

export const getRowDisplayOptions = (nodes: INode[]): IRowDsiplay[] => {
  return [
    { name: "Single", value: "single" },
    {
      name: "Notes",
      value: "notes",
      rowMap: [...new Set(nodes.map((node) => node.data))].sort(sortNotes),
    },
  ];
};
