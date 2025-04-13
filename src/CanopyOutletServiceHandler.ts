import type { API, CharacteristicValue, Logging, Service } from 'homebridge';
import { IServiceOnEventHandler } from './IServiceOnEventHandler';
import { Gpio } from 'onoff';

export type GpioNumber = number;

export class CanopyOutletServiceHandler implements IServiceOnEventHandler {
  private gpio: Gpio;
  constructor(
    private readonly log: Logging,
    private readonly GpioPin: GpioNumber,
    private readonly service: Service,
    private readonly api: API,
  ) {
    this.gpio = new Gpio(this.GpioPin, 'out');
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async logGpioState(): Promise<void>{
    const gpioState = await this.get();
    this.log.debug(`${this.service.displayName} connect to ${this.GpioPin} is ${gpioState ? 'high' : 'low'}`);
  }
  
  public async set(value: CharacteristicValue): Promise<void> {
    const outletEnabled: boolean = value as boolean;
    if(outletEnabled){
      await this.gpio.write(Gpio.HIGH);
      await this.logGpioState();
      await this.delay(200);
      this.service.updateCharacteristic(this.api.hap.Characteristic.On, Gpio.LOW);
    } else{
      await this.gpio.write(Gpio.LOW);
      await this.logGpioState();
    }
  }
    
  public async get(): Promise<CharacteristicValue> {
    return await this.gpio.read();
  }
}