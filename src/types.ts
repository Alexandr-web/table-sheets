import { ICell } from "@/interfaces";

export type TCellPos = [string, number];
export type TAccumulatorCells = Array<ICell[]>;
export type TCellsLinkedToFormulas = Map<string, Set<string>>;