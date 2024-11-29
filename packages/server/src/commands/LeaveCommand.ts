import { Command } from "@colyseus/command";
import { MemoryRoom } from "../rooms/MemoryRoom";
import { PlayerState } from "../rooms/schema/PlayerState";

type Payload = {
    client: any
};

export class LeaveCommand extends Command<MemoryRoom, Payload> {

    async execute({ client }: Payload) {

        console.log("LeaveCommand executed");

        if(this.room.isActivePlayer(client.id)) {
            this.room.nextPlayer();
        }
        
        this.room.removePlayer(client.id);
    }
}