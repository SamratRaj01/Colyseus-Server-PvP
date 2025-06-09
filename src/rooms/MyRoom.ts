import { Room, Client } from "@colyseus/core";
import { MyRoomState } from "./schema/MyRoomState";
import { PlayerState } from "./schema/PlayerState";

export class MyRoom extends Room<MyRoomState> {
  maxClients = 4;
  state = new MyRoomState();

  playerCount = 0;

  onCreate(options: any) {

    this.state.currentTurn = 1;

    this.onMessage("ping", (client, message) => {
      console.log(
        "ping received from",
        client.sessionId,
        "with message:",
        message
      );
      client.send("pong", { message: "pong" });
    });

    this.onMessage("next_turn", (client, message) => {
      this.state.currentTurn += 1;
      console.log("Turn Changed " + (this.state.currentTurn));
      console.log(this.state.currentTurn);
    });

    this.onMessage("status", (client, message) => {

      client.send("status", "Status currentTurn " + (this.state.currentTurn) + " number of Player " + (this.playerCount) + " player name " + JSON.stringify(this.state.players));
    });

    this.onMessage("move", (client, message) => {
      const myPlayer = this.state.players.get(client.sessionId);

      this.state.currentTurn += 1;

      console.log("Before : " + JSON.stringify(myPlayer));

      // Directly mutate the schema object's fields — this is tracked automatically
      myPlayer.x = Math.floor(Math.random() * 3);
      myPlayer.y = Math.floor(Math.random() * 3);
      myPlayer.z = 0;

      // Optional: send position back to the client
      client.send("move", {
        x: myPlayer.x,
        y: myPlayer.y,
        z: myPlayer.z
      });

      console.log("After : " + JSON.stringify(myPlayer));
    });

    this.onMessage("MovementData", (client, message) => {

      const myPlayer = this.state.players.get(client.sessionId);

      // Directly mutate the schema object's fields — this is tracked automatically
      myPlayer.x = message.x;
      myPlayer.y = message.y;
      myPlayer.z = message.z;
      myPlayer.qx = message.qx;
      myPlayer.qy = message.qy;
      myPlayer.qz = message.qz;
    });

    this.onMessage("bullet_fired", (client, message) => {

      console.log("Bullet Fired By Player " + client.sessionId);
      console.log("Bullet Config " + JSON.stringify(message));

      // message contains position & direction of bullet
      const bulletData = {
        shooterId: client.sessionId,
        position: message.position,  
        direction: message.direction,
        speed : message.speed
      };

      // Broadcast to all other clients (excluding sender if needed)
      this.broadcast("spawn_bullet", bulletData , { except: client });

    });

    this.onMessage("player_hit", (client, message)=>{
      
      console.log("Client ID  : " + message.targetID);
       const targetClient = this.clients.getById(message.targetID);
       targetClient.send("player_hit");

    });

  }

  onJoin(client: Client, options: any) {
    console.log(client.sessionId, "joined!");

    const playerInfo = new PlayerState();
    playerInfo.x = 0;
    playerInfo.y = 5;
    playerInfo.z = 0;
    playerInfo.qx = 0;
    playerInfo.qy = 0;
    playerInfo.qz = 0;

    // Add Player to the state
    this.state.players.set(client.sessionId, playerInfo);

    console.log({
      client: client.sessionId,
      data: {
        x: playerInfo.x,
        y: playerInfo.y,
        z: playerInfo.z,
        qx: playerInfo.qx,
        qy: playerInfo.qy,
        qz: playerInfo.qz,
      }
    })

    this.playerCount++;

    client.send("create_player", {
      x: playerInfo.x,
      y: playerInfo.y,
      z: 0,
    });
  }

  onLeave(client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");
    this.state.players.delete(client.sessionId);
    if (this.playerCount > 0) this.playerCount--;
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }

}
