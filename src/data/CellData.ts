export interface CellData {

  id: string;

  physicalX: number;
  physicalY: number;
  physicalZ: number;

  isFail: boolean;

  type?: CellType;
}

export type CellType =
| "reference"
| "fail"
| "normal";