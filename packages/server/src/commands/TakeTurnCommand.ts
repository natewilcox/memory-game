import { Command } from "@colyseus/command";
import { MemoryRoom } from "../rooms/MemoryRoom";

type Payload = {
    client: any,
    i: number
};

export class TakeTurnCommand extends Command<MemoryRoom, Payload> {

    async execute({ client, i }: Payload) {

        if(!this.room.isActivePlayer(client.id)) {
            return;
        }

        if(this.room.isVisible(i)) {
            return;
        }

        if(this.room.isBlocked()) {
            return;
        }

        console.log("TakeTurnCommand executed");
        console.log(`${client.id} selects ${i}`);

        const openTileIndex = this.room.getOpenTileAt();
        this.room.showTile(i);

        if(openTileIndex > -1) {
            
            if(this.room.isMatch(openTileIndex, i)) {
                console.log('match found');
                this.room.setTileOwner(i, client.id);
                this.room.setTileOwner(openTileIndex, client.id);
            }
            else {
                console.log('no match found');
                this.room.blockInput();
                this.room.setTileState(i, 1);
                this.room.setTileState(openTileIndex, 1);

                this.clock.setTimeout(() => {

                    this.room.hideTile(i);
                    this.room.hideTile(openTileIndex);
                    this.room.setTileState(i, 0);
                    this.room.setTileState(openTileIndex, 0);

                    this.room.blockInput(false);
                    this.room.nextPlayer();
                }, 500);
            }
        }
    }
}