import { GemColor, type Field, Move, Pos, BoardType } from "./types";

const areNextToEachOther = (pos1: Pos, pos2: Pos): boolean => {
    return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y) === 1;
}

export default class Board {

    private board: BoardType;

    constructor(public readonly width: number, public readonly height: number) {
        this.fillRandomly();
    }
    private createRandomField(): Field {

        const gem = Object.keys(GemColor)[Math.floor(Math.random() * Object.keys(GemColor).length)] as GemColor;

        return {
            gem,
        }
    }
    public fillRandomly() {
        this.board = this.getRandomBoard();
    }
    private getRandomBoard() {

        let board: BoardType = [];

        for (let y = 0; y < this.height; y++) {
            let row: Field[] = [];
            for (let x = 0; x < this.width; x++) {
                row.push(this.createRandomField());
            }
            board.push(row);
        }
        return board;
    }
    public render(): string {

        const result = this.board.map(row => row.map(field => GemColor[field.gem]).join('')).join('\n');

        return result;
    }
    private getField(pos: Pos): Field | null {
        try {
            return this.board[pos.y][pos.x];
        } catch (err) {
            return null;
        }
    }
    /**
     * validates that the move
     * - is between two fields that are on the board
     * - is between two horizontally or vertically adjacent fields
     * - results in a position with at least one row
     * 
     */
    public isLegalMove(move: Move): boolean {

        const from = this.getField(move.from);
        const to = this.getField(move.to);

        if (!from || !to) return false;

        if (!areNextToEachOther(move.from, move.to)) return false;

        const newBoard = this.applyMoveToBoard(this.board, move);

        const newBoardHasRows = this.getRows(newBoard).length > 0;

        return newBoardHasRows;
    }
    /**
     * creates a new copy of the board with the move applied.
     */
    private applyMoveToBoard(board: BoardType, move: Move) {

        // create a copy of the board
        board = board.slice();

        const fromField = this.getField(move.from)!;
        const toField = this.getField(move.to)!;
    
        board[move.from.y][move.from.x] = toField;
        board[move.to.y][move.to.x] = fromField;

        return board;
    }
    public makeMove(move: Move) {

        if (!this.isLegalMove(move)) return false;

        this.board = this.applyMoveToBoard(this.board, move);

        return true;
    }
    /**
     * gets all horizontal and vertical rows of at least minLength that are the same color.
     */
    private getRows(board: BoardType, minLength = 3): GemColor[][][] {
        let rows: GemColor[][][] = [];

        // Check horizontally
        for (let y = 0; y < this.height; y++) {
            let count = 1;
            for (let x = 1; x < this.width; x++) {
                if (board[y][x].gem === board[y][x - 1].gem) {
                    count++;
                } else {
                    if (count >= minLength) {
                        // @ts-ignore
                        rows.push(board[y].slice(x - count, x).map(field => field.gem));
                    }
                    count = 1;
                }
            }
            if (count >= minLength) {
                // @ts-ignore
                rows.push(board[y].slice(this.width - count).map(field => field.gem));
            }
        }

        // Check vertically
        for (let x = 0; x < this.width; x++) {
            let count = 1;
            for (let y = 1; y < this.height; y++) {
                if (board[y][x].gem === board[y - 1][x].gem) {
                    count++;
                } else {
                    if (count >= minLength) {
                        // @ts-ignore
                        rows.push(board.slice(y - count, y).map(row => row[x].gem));
                    }
                    count = 1;
                }
            }
            if (count >= minLength) {
                // @ts-ignore
                rows.push(board.slice(this.height - count).map(row => row[x].gem));
            }
        }
        return rows;
    }
}