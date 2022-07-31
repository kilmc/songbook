import type { INode } from "../types";

export const getPosition = (node: INode) => {
  const value = Math.trunc(node.position / 12);
  return value == 0 ? 1 : value + 1;
};

export const getDuration = (node: INode) => {
  const value = Math.trunc(node.duration / 12);
  return value;
};

export const getGridColumn = (node: INode) => {
  return `grid-column: ${getPosition(node)} / span ${getDuration(node)};`;
};

export const generateCSSVars = (obj: object) => {
  return Object.entries(obj)
    .map(([key, value]) => `--${key}:${value}`)
    .join(";");
};

export const numberRangesOverlap = (
  x1: number,
  x2: number,
  y1: number,
  y2: number
) => {
  return x1 < y2 && y1 < x2;
};

export const getNodeEndPosition = (node: INode) => {
  return node.position + node.duration;
};
