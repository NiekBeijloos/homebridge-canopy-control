import { Gpio } from 'onoff';
import type { CharacteristicValue, Logging } from 'homebridge';
import { IServiceOnEventHandler } from './IServiceOnEventHandler';

export type GpioNumber = number;

export class CanopySwitchServiceHandler implements IServiceOnEventHandler  {

  private gpio: Gpio;

  constructor(
        private readonly log: Logging,
        private readonly GpioPin: GpioNumber,
        private readonly serviceName: string,
  ) {
    this.gpio = new Gpio(this.GpioPin, 'out');
  }
  
  public async set(value: CharacteristicValue): Promise<void> {
    const switchEnabled: boolean = value as boolean;
    if(switchEnabled){
      await this.gpio.write(Gpio.HIGH);
    } else{
      await this.gpio.write(Gpio.LOW);
    }
    this.log.info(`${this.serviceName} switch connected to ${this.GpioPin} is ${await this.get() ? 'high' : 'low'}`);
  }
    
  public async get(): Promise<CharacteristicValue> {
    return await this.gpio.read();
  }
}