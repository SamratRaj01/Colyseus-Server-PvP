import { Room, Client } from "@colyseus/core";
import { MyRoomState } from "./schema/MyRoomState";
import { PlayerState } from "./schema/PlayerState";

export class MyRoom extends Room<MyRoomState> {
  maxClients = 4;
  state = new MyRoomState();
  playerCount = 0;

  onCreate(options: any) {

    this.state.currentTurn = 1;

    this.SetUpMessageHandlers();

    console.log(`Room ${this.roomId} created`);

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

  // Setup all message handlers
  private SetUpMessageHandlers() {

    this.onMessage("ping", (client, message) => {
      console.log(`Ping from ${client.sessionId}:`, message);
      client.send("pong", { message: "pong" });
    });

    this.onMessage("next_turn", () => {
      this.state.currentTurn += 1;
      console.log("Turn changed to:", this.state.currentTurn);
    });

    this.onMessage("status", (client) => {
      client.send("status", `Status - Turn: ${this.state.currentTurn}, Players: ${this.playerCount}, Player Data: ${JSON.stringify(this.state.players)}`);
    });

    this.onMessage("move", (client) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;

      this.state.currentTurn += 1;

      console.log("Before Move:", JSON.stringify(player));
      player.x = Math.floor(Math.random() * 3);
      player.y = Math.floor(Math.random() * 3);
      player.z = 0;
      console.log("After Move:", JSON.stringify(player));

      client.send("move", { x: player.x, y: player.y, z: player.z });
    });

    this.onMessage("MovementData", (client, message) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;

      Object.assign(player, {
        x: message.x,
        y: message.y,
        z: message.z,
        qx: message.qx,
        qy: message.qy,
        qz: message.qz,
      });
    });

    this.onMessage("bullet_fired", (client, message) => {
      console.log(`Bullet fired by ${client.sessionId}`);
      console.log("Bullet config:", message);

      const bulletData = {
        ownerID: client.sessionId,
        position: message.position,  
        direction: message.direction,
        speed : message.speed,
        ownerBulletType: message.ownerBulletType,
        lobCharge:message.lobCharge
      };

      this.broadcast("spawn_bullet", bulletData, { except: client });
    });

    this.onMessage("player_hit", (client, message) => {
      const targetId = message.targetID;
      const target = this.clients.find(c => c.sessionId === targetId);
      if (target) {
        console.log(`Player hit: ${targetId}`);
        target.send("player_hit");
      } else {
        console.warn(`Target client not found: ${targetId}`);
      }
    });
  }

}
