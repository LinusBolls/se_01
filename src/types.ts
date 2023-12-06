export enum GemColor {
    RED = '🛑',
    BLUE = '🔷',
    GREEN = '🟩',
    YELLOW = '🟡',
    PURPLE = '💜',
}

export type Field = {
    gem: GemColor;
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