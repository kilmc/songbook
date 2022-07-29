import type { INode } from "../stores/songStore";

export const getPosition = (node: INode) => {
  const value = Math.trunc(node.position / 12);
  return value == 0 ? 1 : value + 1;
};

export const getDuration = (node: INode) => {
  const value = Math.trunc(node.duration / 12);
  return value;
};

export const getGridColumn = (node: INode) => {
  return `grid-column: ${getPosition(node)} / span ${getDuration(node)}`;
};
