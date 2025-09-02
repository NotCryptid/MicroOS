//% block="settings" color=#3b3b3b icon="\uf0c7"
//% groups='["Numbers", "Strings", "Arrays", "Operations"]'
namespace blockSettings {
    /**
     * Set named settings to a given number.
     * 
     * @param name   The name of the setting to set
     */
    //% blockId=block_settings_write_number
    //% block="set setting $name to number $value"
    //% weight=100 blockGap=8 group="Numbers"
    export function writeNumber(name: string, value: number) {
        settings.writeNumber(name, value);
    }

    /**
     * Read named setting as a number.
     * 
     * @param name   The name of the setting to read
     */
    //% blockId=block_settings_read_number
    //% block="read setting $name as number"
    //% weight=90 group="Numbers"
    export function readNumber(name: string) {
        return settings.readNumber(name);
    }

    /**
     * Set named settings to a given string.
     * 
     * @param name   The name of the setting to set
     */
    //% blockId=block_settings_write_string
    //% block="set setting $name to string $value"
    //% weight=80 blockGap=8 group="Strings"
    export function writeString(name: string, value: string) {
        settings.writeString(name, value);
    }

    /**
     * Read named setting as a string.
     * 
     * @param name   The name of the setting to read
     */
    //% blockId=block_settings_read_string
    //% block="read setting $name as string"
    //% weight=70 group="Strings"
    export function readString(name: string) {
        return settings.readString(name);
    }

    /**
     * Set named settings to a given array of numbers.
     * 
     * @param name   The name of the setting to set
     */
    //% blockId=block_settings_write_number_array
    //% block="set setting $name to number array $value"
    //% weight=60 blockGap=8 group="Arrays"
    export function writeNumberArray(name: string, value: number[]) {
        settings.writeNumberArray(name, value);
    }

    /**
     * Read named setting as an array of numbers.
     * 
     * @param name   The name of the setting to read
     */
    //% blockId=block_settings_read_number_array
    //% block="read setting $name as number array"
    //% weight=50 group="Arrays"
    export function readNumberArray(name: string) {
        return settings.readNumberArray(name);
    }

    /**
     * Remove a named setting.
     * 
     * @param name   The name of the setting to remove
     */
    //% blockId=block_settings_remove
    //% block="remove setting with name $name"
    //% weight=40 blockGap=8 group="Operations"
    export function remove(name: string) {
        return settings.remove(name);
    }

    /**
     * Check if a named setting exists.
     * 
     * @param name   The name to check
     */
    //% blockId=block_settings_exists
    //% block="setting with name $name exists"
    //% weight=30 blockGap=8 group="Operations"
    export function exists(name: string) {
        return settings.exists(name);
    }

    /**
     * Return a list of names for all used settings.
     */
    //% blockId=block_settings_lists
    //% block="array of all settings names"
    //% weight=20 blockGap=8 group="Operations"
    export function list() {
        return settings.list();
    }

    /** 
    * Delete all non-system settings.
    */
    //% blockId=block_settings_clear
    //% block="clear all settings"
    //% weight=10 blockGap=8 group="Operations"
    export function clear(): void {
        settings.clear();
    }
}