export type High = 1;
export type Low = 0;
export type Direction = 'in' | 'out' | 'high' | 'low';
export type Edge = 'none' | 'rising' | 'falling' | 'both';

export type BinaryValue = High | Low;
export type ValueCallback = (err: Error | null | undefined, value: BinaryValue) => void;

export class Gpio {
  private value : BinaryValue = 0;
  static HIGH: High;
  static LOW: Low;    
  static accessible: boolean;

  constructor(
    private readonly gpioPin: number,
    private _direction: Direction,
  ) {
  }

  read(callback: ValueCallback): void;
  read(): Promise<BinaryValue>;
  read(callback?: ValueCallback): void | Promise<BinaryValue> {
    if (callback) {
      callback(null, this.value);
    } else {
      return Promise.resolve(this.value);
    }
  }

  public readSync(): BinaryValue {
    return this.value;
  }

  write(value: BinaryValue, callback: (err: Error | null | undefined) => void): void;
  write(value: BinaryValue): Promise<void>;
  write(value: BinaryValue, callback?: (err: Error | null | undefined) => void): void | Promise<void> {
    this.value = value;
    if (callback) {
      callback(null);
    } else {
      return Promise.resolve();
    }
  }

  public writeSync(value: BinaryValue): void {
    this.value = value;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public watch(_: ValueCallback): void {}
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public unwatch(_: ValueCallback): void {}
  public unwatchAll(): void {}
  public direction(): Direction {
    return this._direction;
  }
  public setDirection(direction: Direction): void {
    this._direction = direction;
  }
  public edge(): Edge {
    return 'none';
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public setEdge(_: Edge): void {}

  public activeLow(): boolean {
    return false;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public setActiveLow(_: boolean): void {}

  unexport(): void {}
}