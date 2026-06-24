import { Vector3 } from "@babylonjs/core";
import type { CellData } from "../../data/CellData";


const CELL_SPACING = 1.2;


export class CoordinateMapper {


  static physicalToWorld(
    cell: CellData
  ): Vector3 {


    return new Vector3(

      // horizontal
      cell.physicalX * CELL_SPACING,


      // vertical layer
      cell.physicalZ * CELL_SPACING,


      // depth
      cell.physicalY * CELL_SPACING

    );
  }



  static worldToPhysical(
    position: Vector3
  ) {

    return {

      x: Math.round(
        position.x / CELL_SPACING
      ),

      y: Math.round(
        position.z / CELL_SPACING
      ),

      z: Math.round(
        position.y / CELL_SPACING
      )

    };

  }

}