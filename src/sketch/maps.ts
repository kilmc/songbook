import type { TLyricActionsObj } from "./types";

export const actions: TLyricActionsObj = {
  delete: 1,
  insert: 0,
  replace: 1,
  split: 1,
  combine: 1,
};

const arr = [1, 2, 3, 4, 5];
let arrB = [...arr];

arrB.splice(1, 1);
arrB.splice(1, 0);
