import Board from "./Board";

import { createInterface } from "readline";
import { Move } from "./types";

const readLine = createInterface({
    input: process.stdin,
    output: process.stdout
});

const parseMove = (input: string): Move => {

    try {
        // @ts-ignore
        const [_, fromX, fromY, toX, toY] = input.match(/^(\d+),(\d+) (\d+),(\d+)$/);

        return {
            from: {
                x: parseInt(fromX),
                y: parseInt(fromY),
            },
            to: {
                x: parseInt(toX),
                y: parseInt(toY),
            },
        }
    } catch (err) {
        throw new Error(`failed to parse move from "${input}"`);
    }
}

async function promptInput(prompt: string) {

    const value = await new Promise<string>((res, rej) => {
        readLine.question(prompt, res);
    });
    readLine.close();

    return value;
}

async function main() {
    const board = new Board(10, 10);

    console.log(board.render());

    const moveInput = await promptInput("please enter a move in the format x1,y1 x2,y2: ");

    const move = parseMove(moveInput);

    const isValidMove = board.makeMove(move);

    if (!isValidMove) {
        console.error('sorry, that move does not lead to a valid position.');

        return;
    }
    console.log(board.render());

    const compounds = board.getShapes().filter(shape => shape.type === "COMPOUND");

    if (compounds.length) {
        console.log("🎉 this board contains " + compounds.length +  " compound shapes! 🎉");
    }
    console.log(board.getShapes());
}
main();