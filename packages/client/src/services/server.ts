import { ClientMessages, MessageType } from "@natewilcox/memory-game-types";
import { Client, Room } from "colyseus.js";

export enum ServerEvents {
    OnStateChange = 'onstatechange',
    OnMessage = 'onmessage'
}

export class ColyseusServerService {

    private static instance: ColyseusServerService;

    private serverUrl!: string;
    private room!: Room;
    private client!: Client;
    private serverHandlers = new Map<number, (data: any) => void>();
    private reconnectionToken!: string;
    private isTryingToReconnect = false;

    private constructor() {
    }
    
    static getInstance<T, M>() {
        
        if(!ColyseusServerService.instance) {
            ColyseusServerService.instance = new ColyseusServerService();
        }

        return ColyseusServerService.instance as ColyseusServerService;
    }

    public configure(url: string) {
        this.client = new Client(url);
        this.serverUrl = url;
    }

    get SessionID() {
        return this.room.sessionId;
    }

    get RoomId() {
        return this.room.roomId;
    }

    get isConnected() {
        return this.room.connection.isOpen;
    }

    get canReconnect() {
        return this.reconnectionToken != null;
    }

    get state() {
        return this.room.state;
    }

    async connect(roomName: string, options?: any) {

        try {

            this.room = !options?.roomId 
                ? await this.client.joinOrCreate(roomName, options) 
                : await this.client.joinById(options.roomId, options);
                
            console.log(this.room.sessionId, "joined", this.room.name, "roomId", this.room.roomId);
            
            //store reconnection details
            this.reconnectionToken = this.room.reconnectionToken;
            console.log('reconnectionToken=' + this.reconnectionToken);

            //add listeners to room
            this.configureRoomListeners(this.room);

            this.isTryingToReconnect = true;
            this.listenAndReconnect();

            
        }
        catch(e) {
            console.error("JOIN ERROR", e);
            throw new Error("Exception while joining room")
        }
    }

    async reconnect() {

        if(this.room) {
            console.log("closing connection");
            this.disconnect();
        }

        try {
            this.client = new Client(this.serverUrl);

            this.room = await this.client.reconnect(this.reconnectionToken);
            console.log(this.room.sessionId, "reconnected", this.room.name, "roomId", this.room.roomId);

            //store reconnection details
            this.reconnectionToken = this.room.reconnectionToken;
            console.log('reconnectionToken=' + this.reconnectionToken);

            //add listeners to room
            this.configureRoomListeners(this.room);

            return this.room;
        }
        catch(e) {
            console.error("Unable to reconnect to room", e);
        }
    }

    disconnect() {
        console.log('disconnecting from room');
        this.room.connection.close();
    }

    async leave() {
        this.isTryingToReconnect = false;
        await this.room.leave(true);
    }

    private configureRoomListeners(room: Room) {

        room.onMessage(ClientMessages.SendMessage, (data) => {

            const handler = this.serverHandlers.get(data.type);
       
            if(handler) {
                handler(data);
            }
        });

        room.onStateChange(() => {

            const handler = this.serverHandlers.get(-1);
       
            if(handler) {
                handler(this.room);
            }
        });
    }
    
    async listenAndReconnect() {

        //if not connected, try to reconnect, 
        //check again in 1 second
        setTimeout(async () => {
            
            if(this.isTryingToReconnect) {

                if(!this.room.connection.isOpen) {

                    await this.reconnect();
                }
                
                this.listenAndReconnect();
            }  
        }, 1000);
    }

    send(msgType: MessageType, data?: any) {
     
        this.room.send(ClientMessages.SendMessage, {
            type: msgType,
            ...data
        });
    }

    on(msgType: number, cb: (data: any) => void, context?: any) {
        this.serverHandlers.set(msgType, cb);
    }

    onRoomStateChange(cb: (room: Room) => void, context?: any) {
        this.serverHandlers.set(-1, cb);
    }
}