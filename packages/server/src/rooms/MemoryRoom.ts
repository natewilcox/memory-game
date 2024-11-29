import { Room, Client } from "@colyseus/core";
import { MemoryRoomState } from "./schema/MemoryRoomState";
import { Dispatcher } from "@colyseus/command";
import { JoinCommand } from "../commands/JoinCommand";
import { CreateBoardCommand } from "../commands/CreateBoardCommand";
import { TakeTurnCommand } from "../commands/TakeTurnCommand";
import { PlayerState } from "./schema/PlayerState";
import { LeaveCommand } from "../commands/LeaveCommand";
import { ClientService } from "../services/client";
import { Board } from "../objects/board";
import { PeekCommand } from "../commands/PeekCommand";
import { MessageType } from "@natewilcox/memory-game-types";

export class MemoryRoom extends Room<MemoryRoomState> {

    board: Board;
    
    client: ClientService;

    maxClients = 2;
    dispatcher: Dispatcher<MemoryRoom> = new Dispatcher(this);

    private player_index = 0;

    onCreate(options: any) {

        this.client = new ClientService(this);
        this.setState(new MemoryRoomState());

        this.dispatcher.dispatch(new CreateBoardCommand(), { });
    
        this.client.on(MessageType.TakeTurn, (client, message) => {
            this.dispatcher.dispatch(new TakeTurnCommand(), { client, i: message.i });
        });

        this.client.on(MessageType.Restart, (client, message) => {
            this.dispatcher.dispatch(new CreateBoardCommand(), { client });
        });

        this.client.on(MessageType.Peek, (client) => {
            this.dispatcher.dispatch(new PeekCommand(), { client });
        });
    }

    onJoin(client: Client, options: any) {
        console.log(client.sessionId, "joined!");
        this.dispatcher.dispatch(new JoinCommand(), { client });
    }

    onLeave(client: Client, consented: boolean) {
        console.log(client.sessionId, "left!");
        this.dispatcher.dispatch(new LeaveCommand(), { client });
    }

    onDispose() {
        console.log("room", this.roomId, "disposing...");
    }

    addPlayer(player: PlayerState) {
        
        if(this.state.players.length == 0) {
            this.state.activePlayer = player.name;
        }

        this.state.players.push(player);
    }

    removePlayer(playerName: string) {

        const index = this.state.players.findIndex(p => p.name == playerName);
        const player = this.state.players.find(p => p.name == playerName);
        
        if (player) {
            this.state.players.splice(index, 1);
        }
    }

    setActivePlayer(playerName: string) {

        this.player_index = this.state.players.findIndex(p => p.name == playerName);
        this.state.activePlayer = playerName;
    }

    isActivePlayer(playerName: string) {
        return this.state.activePlayer == playerName;
    }

    nextPlayer() {
        this.player_index = (this.player_index + 1) % this.state.players.length;
        this.state.activePlayer = this.state.players[this.player_index].name;
    }

    getPlayerCount(): number {
        return this.state.players.length;
    }

    lockRoom() {
        this.lock();
    }

    showTile(i: number) {
        this.state.numbers.setAt(i, this.board.get(i));
    }

    setTileOwner(i: number, playerName: string) {
        this.state.answerer[i] = playerName;
    }

    setTileState(i: number, state: number) {
        this.state.number_state[i] = state;
    }

    hideTile(i: number) {
        this.state.numbers.setAt(i, -1);
    }

    isVisible(i: number) {
        return this.state.numbers[i] > -1;
    }

    isMatch(i1: number, i2: number) {
        return this.state.numbers[i1] == this.state.numbers[i2]; 
    }

    blockInput(block: boolean = true) {
        this.state.block = block;
    }

    isBlocked() {
        return this.state.block;
    }

    getOpenTileAt(): number {

        for(let i=0; i<this.state.numbers.length; i++) {

            if(this.state.numbers[i] != -1 && this.state.answerer[i] == "") {
                return i;
            }
        }
    }
}
