import { Command } from "@colyseus/command";
import { MemoryRoom } from "../rooms/MemoryRoom";

type Payload = {
    client: any
};

export class PeekCommand extends Command<MemoryRoom, Payload> {

    async execute({ client }: Payload) {

        console.log("PeekCommand executed");

        if (this.state.block || !this.state.peek) {
            console.log("illegal action");
            return;
        }

        this.state.block = true;
        this.state.peek = false;

        let prev_hidden = false;

        const peek_tile = (i: number) => {

            if (!this.room.isVisible(i)) {
                this.room.showTile(i);
                this.room.setTileState(i, 1);
                prev_hidden = true;
            }
            else {
                prev_hidden = false;
            }

            this.clock.setTimeout(() => {

                if (prev_hidden) {
                    this.room.hideTile(i);
                    this.room.setTileState(i, 0);
                }

                if (i+1 < 20) {
                    peek_tile(i + 1);
                }
                else {
                    this.state.block = false;
                }

            }, 300);
        }

        peek_tile(0);
    }
}