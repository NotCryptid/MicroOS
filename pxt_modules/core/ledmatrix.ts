/**
 * Control the 5x5 LED matrix.
 */
//% color="#ff0000" weight=85 icon="\uf005"
namespace ledmatrix {
    //% shim=ledmatrix::plot
    export function plot(x: number, y: number): void;
    //% shim=ledmatrix::clear
    export function clear(): void;
}
