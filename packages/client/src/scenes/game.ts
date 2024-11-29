import Phaser from "phaser";
import { ColyseusServerService } from "../services/server";
import { MessageType } from "@natewilcox/memory-game-types";

export class Game extends Phaser.Scene {

    private squares: Phaser.GameObjects.Graphics[] = [];
    private labels: Phaser.GameObjects.Text[] = [];

    private server!: ColyseusServerService;
    private server_host = import.meta.env.VITE_HOST;

    async create() {

        this.server = ColyseusServerService.getInstance();
        this.server.configure(this.server_host);
        await this.server.connect("memory_room");

        this.server.onRoomStateChange((room) => {
            this.drawBoard(room.state);
        });
    }

    drawBoard(state: any) {

        const peek = state.peek;
        const numbers: number[] = state.numbers;
        const answerers: string[] = state.answerer;
        const states: number[] = state.number_state;

        this.clearBoard();

        const gameW = this.game.canvas.width;
        const gameH = this.game.canvas.height;

        const isPortrait = gameH > gameW;
        const colums = isPortrait ? 4 : 5;
        const rows = isPortrait ? 5 : 4;

        const squareSize = isPortrait ? (gameW-50) / colums : (gameH-50) / rows;
        const boardWidth = squareSize*5;

        //draw header
        const header_footer_height = isPortrait ? ((gameH - (squareSize*5) - 60)/2)-15 : gameH - 20;
        const header_footer_width = isPortrait ? gameW - 20 : ((gameW - (squareSize*5) - 60)/2)-15 ;

        const header = this.add.graphics();
        header.fillStyle(0xffffff, 1);
        header.fillRoundedRect(10, 10, header_footer_width, header_footer_height, 10);

        let status_text = this.server.SessionID == state.activePlayer ? "Your Turn" : "Their Turn";
        let header_text = state.players.length == 1 ? "Solo" : `PvP - ${status_text}`;

        const is_game_active = answerers.some(a => a == "");

        if (!is_game_active) {

            const my_score = answerers.filter(a => a == this.server.SessionID).length;

            header_text = my_score == 10 ? "Tie" : my_score > 10 ? "You Win" : "You Lose";
            status_text = "";
        }

        const status_x = isPortrait ? gameW / 2 : header_footer_width/2;
        const status_y = (header_footer_height/2)+10;
        const status_size = isPortrait ? `${header_footer_height*.55}px` : `${header_footer_width*.55}px`;

        const player_count = this.add.text(status_x, status_y, header_text, {
            fontSize: status_size,
            color: 'black',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5, 0.5);
        this.labels.push(player_count);

        player_count.setRotation(isPortrait ? 0 : Math.PI/2);

        //draw footer
        const footer_x = isPortrait ? 10 : gameW - header_footer_width - 15;
        const footer_y = isPortrait ? gameH-header_footer_height-20 : 10;

        const footer = this.add.graphics();
        footer.fillStyle(0xffffff, 1);
        footer.fillRoundedRect(footer_x, footer_y, header_footer_width, header_footer_height, 10);

        if (!is_game_active) {

            const restart = this.add.text(gameW / 2, gameH - (header_footer_height/2), "Tap to restart", {
                fontSize: `${header_footer_height*.55}px`,
                color: 'black',
                fontFamily: 'Arial',
                fontStyle: 'bold'
            }).setOrigin(0.5, 1);

            restart.setInteractive();
            restart.on('pointerdown', () => this.restartClickedHandler());
            this.labels.push(restart);
        }
        //else if(peek) {

            const action_x = isPortrait ? gameW / 2 : gameW - (header_footer_width/2)-15;
            const action_y = (gameH - (header_footer_height/2))+10;

            const peekCommand = this.add.text(action_x, action_y, "Peek", {
                fontSize: status_size,
                color: 'black',
                fontFamily: 'Arial',
                fontStyle: 'bold'
            }).setOrigin(0.5, 0.5);

            peekCommand.setInteractive();
            peekCommand.on('pointerdown', () => this.peekCommandClickedHandler());
            peekCommand.setRotation(isPortrait ? 0 : Math.PI/2);

            this.labels.push(peekCommand);
        //}

        //draw grid
        const gameX = (gameW / 2) - (((squareSize+10) * colums) / 2) + 5;
        const gameY = (gameH / 2) - (((squareSize+10) * rows) / 2);
        let i = 0;

        console.log(`colums=${colums}`);
        console.log(`rows=${rows}`);

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < colums; c++) {

                const x = ((squareSize+10) * c) + gameX;
                const y = ((squareSize+10) * r) + gameY;
                const square_index = i;
                const number = numbers[square_index];
                const owner = answerers[square_index];
                const isMine = owner == this.server.SessionID;

                let square_bg = 0xffffff;
                if (owner != "") {
                    square_bg = isMine ? 0x98cf7e : 0xcf7e7e;
                }

                const hitArea = new Phaser.Geom.Rectangle(x, y, squareSize, squareSize);
                const square = this.add.graphics();
                square.setDataEnabled();
                square.fillStyle(square_bg, 1);
                square.fillRoundedRect(x, y, squareSize, squareSize, 10);
                square.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
                square.on('pointerdown', () => this.squareClickedHandler(square_index));

                square.data.set('color', 0xffffff);
                this.squares.push(square);

                if (states[square_index] == 1) {
                    this.flash(square, x, y, squareSize);
                }

                if (numbers[square_index] != -1) {
                    const text = this.add.text(x + (squareSize/2), y + (squareSize/2), number + "", {
                        color: 'black',
                        fontSize: '60px',
                        fontFamily: 'Arial',
                        fontStyle: 'bold'
                    }).setOrigin(0.5, 0.5);

                    this.labels.push(text);
                }

                i++;
            }
        }
    }

    clearBoard() {
        this.labels.forEach(label => label.destroy());
        this.squares.forEach(square => square.destroy());
    }

    private peekCommandClickedHandler() {
        this.server.send(MessageType.Peek);
    }

    private restartClickedHandler() {
        this.server.send(MessageType.Restart);
    }

    private squareClickedHandler(i: number) {
        this.server.send(MessageType.TakeTurn, { i });
    }

    private flash(square: Phaser.GameObjects.Graphics, x: number, y: number, w: number) {

        if (square == null || square.data == null) {
            return;
        }

        square.clear();

        if (square.data.get('color') == 0xffffff) {

            square.data.set('color', 0xcf7e7e);
            square.fillStyle(0xcf7e7e, 1);
        }
        else {
            square.data.set('color', 0xffffff);
            square.fillStyle(0xffffff, 1);
        }

        square.fillRoundedRect(x, y, w, w, 10);

        if (square.active) {
            this.time.delayedCall(10, () => this.flash(square, x, y, w));
        }
    }
}
