import { Gpio } from 'onoff';
import type { CharacteristicValue, Logging } from 'homebridge';

export type GpioNumber = number;

export class CanopySwitchServiceHandler {

  private gpio: Gpio;

  constructor(
        private readonly log: Logging,
        private readonly GpioPin: GpioNumber,
  ) {
    this.gpio = new Gpio(this.GpioPin, 'out');
    this.gpio.writeSync(Gpio.LOW);
    this.log.debug(`${this.GpioPin} is ${this.gpio.readSync() ? 'high' : 'low'}`);
  }
  
  public async set(value: CharacteristicValue) {
    const set: boolean = value as boolean;
    if(set){
      await this.gpio.write(Gpio.HIGH);
    } else{
      await this.gpio.write(Gpio.LOW);
    }
    this.log.debug(`${this.GpioPin} is ${await this.gpio.read() ? 'high' : 'low'}`);
  }
    
  public async get(): Promise<CharacteristicValue> {
    return await this.gpio.read();
  }
}