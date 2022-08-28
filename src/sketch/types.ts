export type TMoves = "next" | "current" | "previous";
export type TMovesObj = {
  [k in TMoves]: number;
};

export type TCursorPosition = "start" | "current" | "end";
export type TCursorPositionObj = {
  [k in TCursorPosition]: number;
};

export type TLyricActions =
  | "delete"
  | "insert"
  | "replace"
  | "split"
  | "combine";
export type TLyricActionsObj = {
  [k in TLyricActions]: number;
};
