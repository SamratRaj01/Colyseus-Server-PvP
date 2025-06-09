import { MapSchema, Schema, type } from "@colyseus/schema";
import { PlayerState } from "./PlayerState";

export class MyRoomState extends Schema {

  @type({ map: PlayerState }) players = new MapSchema<PlayerState>();

  @type("number") currentTurn: number;

}
