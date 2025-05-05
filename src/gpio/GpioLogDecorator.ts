import type { Logging } from 'homebridge';
import { BinaryValue, ValueCallback } from 'onoff';
import { IGpio } from './IGpio';

export class GpioLogDecorator implements IGpio {
  constructor(
    private readonly log: Logging,
    private readonly gpio: IGpio,
    private readonly name: string,
  ) {
  }

  public getPin(): number {
    return this.gpio.getPin();
  }

  public read(): Promise<BinaryValue>{
    return this.gpio.read();
  }

  public watch(callback: ValueCallback): void {
    this.gpio.watch(callback);
  }

  public readSync(): BinaryValue {
    return this.gpio.readSync();
  }

  public writeSync(value: BinaryValue): void {
    this.gpio.writeSync(value);
    this.logGpioStateSync();
  }

  public async write(value: BinaryValue) : Promise<void> {
    await this.gpio.write(value);
    await this.logGpioStateAsync();
  }

  private async logGpioStateAsync(): Promise<void>{
    const gpioState = await this.read();
    this.log.info(`${this.name} connected to ${this.gpio.getPin()} is ${gpioState ? 'high' : 'low'}`);
  }

  private logGpioStateSync(): void{
    const gpioState = this.readSync();
    this.log.info(`${this.name} connected to ${this.gpio.getPin()} is ${gpioState ? 'high' : 'low'}`);
  }
}