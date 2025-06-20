import { Schema, type } from "@colyseus/schema";
import { World } from "./World";

export class TestRoomState extends Schema {
    @type(World) World: World = new World();
}