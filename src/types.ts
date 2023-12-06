export enum GemColor {
    RED = '🛑',
    BLUE = '🔷',
    GREEN = '🟩',
    YELLOW = '🟡',
    PURPLE = '💜',
    BOMB = '💣',
}

export type Field = {
    gem: GemColor | null;
}

export type BoardType = Field[][];

export type Pos = {
    x: number,
    y: number,
};

export type Move = {
    from: Pos,
    to: Pos,
}

export type Row = { type: "ROW", length: number, squares: { x: number, y: number, color: GemColor }[] }

export type Compound = {
    type: "COMPOUND",
    intersections: Pos[],
    rows: Row[],
}
export type Shape = Row | Compound;