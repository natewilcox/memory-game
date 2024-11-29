import { Command } from "@colyseus/command";
import { MemoryRoom } from "../rooms/MemoryRoom";
import { PlayerState } from "../rooms/schema/PlayerState";

type Payload = {
    client: any
};

export class JoinCommand extends Command<MemoryRoom, Payload> {

    async execute({ client }: Payload) {

        console.log("JoinCommand executed");

        const player = new PlayerState();
        player.name = client.id;

        this.room.addPlayer(player);

        if(this.room.getPlayerCount() == 2) {
            this.room.lockRoom();
        }
    }
}