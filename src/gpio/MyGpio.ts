import { BinaryValue, ValueCallback } from 'onoff';
import { IGpio } from './IGpio';
import { Logging } from 'homebridge';
import { Gpio as realGpio } from 'onoff';
import { Gpio as gpioMock } from './GpioMock.js';

export class MyGpio implements IGpio {
  private gpio: realGpio;
  private cb: ValueCallback | undefined;
  constructor(

    private readonly gpioPin: number,
    private readonly log: Logging,
  ) {
    if(realGpio.accessible){
      this.gpio = new realGpio(gpioPin, 'out');
    } else{
      this.log.warn(`Pin ${gpioPin} not accessible, using mocked gpio!`);
      this.gpio = new gpioMock(gpioPin, 'out');
    }
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