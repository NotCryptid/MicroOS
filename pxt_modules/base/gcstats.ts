namespace control {
    //% shim=pxt::getGCStats
    function getGCStats(): Buffer {
        return null
    }

    export interface GCStats {
        numGC: number;
        numBlocks: number;
        totalBytes: number;
        lastFreeBytes: number;
        lastMaxBlockBytes: number;
        minFreeBytes: number;
    }

    //% shim=pxt::heapUsed
    export function heapUsed(): number;

    //% shim=pxt::heapTotal
    export function heapTotal(): number;

    //% shim=pxt::heapFree
    export function heapFree(): number;

    /**
     * Get various statistics about the garbage collector (GC)
     */
    export function gcStats(): GCStats {
        const buf = getGCStats()
        if (!buf)
            return null
        let off = 0
        const res: any = {}

        addField("numGC")
        addField("numBlocks")
        addField("totalBytes")
        addField("lastFreeBytes")
        addField("lastMaxBlockBytes")
        addField("minFreeBytes")

        return res

        function addField(name: string) {
            res[name] = buf.getNumber(NumberFormat.UInt32LE, off)
            off += 4
        }
    }    
}