import { Room, Client } from "@colyseus/core";
import { TestRoomState } from "./schema/TestRoomState";


export class MyTestRoom extends Room<TestRoomState> {
  maxClients = 4;
  playerCount = 0;

  onCreate(options: any) {

    console.log(`Room ${this.roomId} created`);

    this.state = new TestRoomState();
        
    // You can set initial values
    // this.state.World.WorldName = "Test World";

  }

  onJoin(client: Client, options: any) {
    console.log(client.sessionId, "Joined!");
  }

  onLeave(client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");

  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }


}