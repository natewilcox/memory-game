import { ClientMessages } from "@natewilcox/memory-game-types";
import { Client, Room } from "colyseus";

export class ClientService {

    private room: Room;
    private clientHandlers = new Map<number, (client: Client, msg: any) => void>();

    constructor(room: Room) {
        this.room = room;

        this.room.onMessage(ClientMessages.SendMessage, (client, data) => {
    
            const handler = this.clientHandlers.get(data.type);
       
            if(handler) {
                handler(client, data);
            }
        });

    }
    
    send(msgType: number, data?: any, client?: Client) {

        if(client) {
            
            client.send(ClientMessages.SendMessage, {
                type: msgType,
                ...data,
            });
            return;
        }
        else {
            this.room.broadcast(ClientMessages.SendMessage, {
                type: msgType,
                ...data,
            });
        }
    }

    on(msgType: number, cb: (client: Client, data: any) => void, context?: any) {
        this.clientHandlers.set(msgType, cb);
    }
}