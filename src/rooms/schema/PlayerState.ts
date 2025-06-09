import { Schema, type } from "@colyseus/schema";

export class PlayerState extends Schema {

  @type("number") public x: number;
  @type("number") public y: number;
  @type("number") public z: number;
  @type("number") public qx: number;
  @type("number") public qy: number;
  @type("number") public qz: number;
 
}