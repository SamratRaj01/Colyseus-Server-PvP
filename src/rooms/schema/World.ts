import { Schema, type } from "@colyseus/schema";

export class World extends Schema {
    @type("string") WorldName: string = "Yo Mero World Ho";
}