import { BinaryValue, Gpio, ValueCallback } from 'onoff';
import { IGpio } from './IGpio';
import { Logging } from 'homebridge';

export class MyGpio implements IGpio {
  private gpio: Gpio;
  private cb: ValueCallback | undefined;
  constructor(
    private readonly gpioPin: number,
    private readonly log: Logging,
  ) {
    this.gpio = new Gpio(gpioPin, 'out');
  }
  
  public getPin(): number {
    return this.gpioPin;
  }

  public read(): Promise<BinaryValue>{
    return this.gpio.read();
  }

  public watch(callback: ValueCallback): void {
    this.cb = callback;
  }

  public readSync(): BinaryValue {
    return this.gpio.readSync();
  }

  public writeSync(value: BinaryValue): void {
    this.gpio.writeSync(value);
    if(this.cb){
      this.cb(null, this.gpio.readSync());
    }
  }

  public async write(value: BinaryValue) : Promise<void> {
    await this.gpio.write(value);
    if(this.cb){
      this.cb(null, await this.gpio.read());
    }
  }
}