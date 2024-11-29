export class Board {
    
    private layout: number[] = [];
    private state: boolean[] = [];
    private answered: boolean[] = [];

    constructor(layout: number[]) {

        this.layout = layout;
        this.state = new Array(this.layout.length).fill(false);
    }

    get(i: number): number {
        return this.layout[i];
    }

    isVisible(i: number) {
        return this.state[i];
    }

    setVisible(i: number) {
        this.state[i] = true;
    }

    hide(i: number) {
        this.state[i] = false;
    }

    isRight(i: number) {
        return this.answered[i];
    }

    setRight(i: number, isRight: boolean) {
        this.answered[i] = isRight;
    }

    public hideAllWrong() {
        
        for(let i=0; i<this.state.length; i++) {

            if(!this.isRight(i)) {
                this.hide(i);
            }
        }
    }

    public static generateLayout(total: number): number[] {

        if(total % 2 != 0) {
            throw new Error("Board total must be an even number");
        }

        const layout: number[] = [];
        const answers = new Set<number>();
    
        while(answers.size < (total/2)) {
            answers.add(Board.getRandomNumber(1, 99));
        }

        for(const [v] of answers.entries()) {
    
            let set = 2;
            while(set > 0) {

                const i = Board.getRandomNumber(0, total-1);

                if(layout[i] === undefined) {

                    layout[i] = v;
                    set--;
                }
            }
        }

        return layout;
    }

    private static getRandomNumber(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}
