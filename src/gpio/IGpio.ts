import { BinaryValue, ValueCallback } from 'onoff';

export interface IGpio {
    writeSync(value: BinaryValue): void;
    write(value: BinaryValue) : Promise<void>;
    read(): Promise<BinaryValue>;
    watch(callback: ValueCallback): void;
    readSync(): BinaryValue;
    getPin(): number;
}