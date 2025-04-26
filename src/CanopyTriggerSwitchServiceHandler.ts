import type { API, CharacteristicValue, Logging, Service } from 'homebridge';
import { IServiceOnEventHandler } from './IServiceOnEventHandler';
import { BinaryValue, Gpio } from 'onoff';

export type GpioNumber = number;

export class CanopyTriggerSwitchServiceHandler implements IServiceOnEventHandler {
  private gpio: Gpio;
  constructor(
    private readonly log: Logging,
    private readonly GpioPin: GpioNumber,
    private readonly service: Service,
    private readonly api: API,
  ) {
    this.gpio = new Gpio(this.GpioPin, 'out');
    this.updateGpioStateSync(Gpio.LOW);
    this.updateUIState(false);
  }
  
  private updateUIState(isOn: boolean) : void{
    this.service.updateCharacteristic(this.api.hap.Characteristic.On, isOn);
  }

  private async logGpioStateAsync(): Promise<void>{
    const gpioState = await this.get();
    this.log.info(`${this.service.displayName} Trigger Switch connected to ${this.GpioPin} is ${gpioState ? 'high' : 'low'}`);
  }

  private logGpioStateSync(): void{
    const gpioState = this.gpio.readSync();
    this.log.info(`${this.service.displayName} Trigger Switch connected to ${this.GpioPin} is ${gpioState ? 'high' : 'low'}`);
  }

  private updateGpioStateSync(value: BinaryValue): void {
    this.gpio.writeSync(value);
    this.logGpioStateSync();
  }

  private async updateGpioStateAsync(value: BinaryValue) : Promise<void> {
    await this.gpio.write(value);
    await this.logGpioStateAsync();
  }
  
  public async set(value: CharacteristicValue): Promise<void> {
    const triggerSwitchisOn: boolean = value as boolean;
    if(triggerSwitchisOn){
      await this.updateGpioStateAsync(Gpio.HIGH);
      setTimeout(async() => {
        await this.updateGpioStateAsync(Gpio.LOW);
        this.updateUIState(false);
      }, 200);
    } else{
      await this.updateGpioStateAsync(Gpio.LOW);
    }
  }
    
  public async get(): Promise<CharacteristicValue> {
    return await this.gpio.read();
  }
}