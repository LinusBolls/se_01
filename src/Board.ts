import { GemColor, Field, Move, Pos, BoardType, Row, Shape, Compound } from "./types";

const areNextToEachOther = (pos1: Pos, pos2: Pos): boolean => {
    return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y) === 1;
}

const getOverlappingSquares = (row1: Row, row2: Row): Pos[] => {

    let overlappingSquares: Pos[] = [];

    for (let square1 of row1.squares) {
        for (let square2 of row2.squares) {
            if (square1.x === square2.x && square1.y === square2.y) {
                overlappingSquares.push(square1);
            }
        }
    }
    return overlappingSquares;
};

export default class Board {

    private board: BoardType;

    constructor(public readonly width: number, public readonly height: number) {
        this.fillRandomly();
    }
    private createRandomField(): Field {

        const generatableColors = Object.keys(GemColor).slice(0, -1);

        const gem = generatableColors[Math.floor(Math.random() * generatableColors.length)] as GemColor;

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

        const result = this.board.map(row => row.map(field => field.gem ? GemColor[field.gem] : "  ").join('')).join('\n');

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

        // create a deep copy of the board
        board = JSON.parse(JSON.stringify(board));

        const fromField = this.getField(move.from)!;
        const toField = this.getField(move.to)!;

        board[move.from.y][move.from.x] = toField;
        board[move.to.y][move.to.x] = fromField;

        return board;
    }
    public tick() {

        const shapes = this.getShapes();

        // do compounds first
        for (const compound of shapes.filter(i => i.type === "COMPOUND") as Compound[]) {

            for (const row of compound.rows) {

                for (const square of row.squares) {

                    this.board[square.y][square.x].gem = null;
                }
            }
            for (const intersection of compound.intersections) {

                // @ts-ignore
                this.board[intersection.y][intersection.x].gem = "BOMB";
            }
        }
        // then do rows
        for (const row of shapes.filter(i => i.type === "ROW") as Row[]) {
            for (const square of row.squares) {

                this.board[square.y][square.x].gem = null;
            }
        }
        // TODO: fill empty squares
    }

    public makeMove(move: Move) {

        if (!this.isLegalMove(move)) return false;

        this.board = this.applyMoveToBoard(this.board, move);

        return true;
    }
    /**
     * gets all horizontal and vertical rows of at least minLength that are the same color.
     */
    private getRows(board: BoardType, minLength = 3): Row[] {
        let rows: Row[] = [];

        // Check horizontally
        for (let y = 0; y < this.height; y++) {
            let count = 1;
            for (let x = 1; x < this.width; x++) {
                if (board[y][x].gem === board[y][x - 1].gem) {
                    count++;
                } else {
                    if (count >= minLength) {
                        let row = [];
                        for (let i = x - count; i < x; i++) {
                            // @ts-ignore
                            row.push({ x: i, y: y, color: board[y][i].gem });
                        }
                        rows.push({ type: "ROW", length: count, squares: row });
                    }
                    count = 1;
                }
            }
            if (count >= minLength) {
                let row = [];
                for (let i = this.width - count; i < this.width; i++) {
                    // @ts-ignore
                    row.push({ x: i, y: y, color: board[y][i].gem });
                }
                rows.push({ type: "ROW", length: count, squares: row });
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
                        let column = [];
                        for (let i = y - count; i < y; i++) {
                            // @ts-ignore
                            column.push({ x: x, y: i, color: board[i][x].gem });
                        }
                        rows.push({ type: "ROW", length: count, squares: column });
                    }
                    count = 1;
                }
            }
            if (count >= minLength) {
                let column = [];
                for (let i = this.height - count; i < this.height; i++) {
                    // @ts-ignore
                    column.push({ x: x, y: i, color: board[i][x].gem });
                }
                rows.push({ type: "ROW", length: count, squares: column });
            }
        }
        return rows;
    }
    /**
     * combines overlapping rows into compounds.
     * 
     * returns a list of compounds and rows that aren't part of a compound.
     */
    public getShapes(): Shape[] {

        const rows = this.getRows(this.board);
        const shapes: Shape[] = [];
        const usedRows = new Set<number>();

        for (let i = 0; i < rows.length; i++) {
            if (!usedRows.has(i)) {
                let compound: Compound = { type: "COMPOUND", rows: [rows[i]], intersections: [] };

                for (let j = i + 1; j < rows.length; j++) {

                    const overlappingSquares = getOverlappingSquares(rows[i], rows[j]);

                    if (overlappingSquares.length) {
                        compound.rows.push(rows[j]);

                        compound.intersections = [...compound.intersections, ...overlappingSquares];

                        usedRows.add(j);
                    }
                }

                if (compound.rows.length > 1) {
                    shapes.push(compound);
                } else {
                    shapes.push(rows[i]);
                }
                usedRows.add(i);
            }
        }
        return shapes;
    }
}