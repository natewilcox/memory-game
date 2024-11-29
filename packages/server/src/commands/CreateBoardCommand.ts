import { Command } from "@colyseus/command";
import { MemoryRoom } from "../rooms/MemoryRoom";
import { Board } from "../objects/board";

type Payload = {
};


export class CreateBoardCommand extends Command<MemoryRoom, Payload> {

    async execute({ }: Payload) {

        console.log("CreateBoardCommand executed");

        const layout = Board.generateLayout(20);
        const board = new Board(layout);
        this.room.board = board;
        
        this.state.numbers.clear();
        this.state.number_state.clear();
        this.state.answerer.clear();
        this.state.peek = true;

        for (let i = 0; i < 20; i++) {
            this.state.numbers[i] = -1;
            this.state.number_state[i] = 0;
            this.state.answerer[i] = "";
        }
    }
}