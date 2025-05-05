import type { Service, API, CharacteristicValue } from 'homebridge';
import { IServiceOnEventHandler } from './IServiceOnEventHandler';
import { IGpio } from './gpio/IGpio';
import { Gpio } from 'onoff';

export class CanopySwitchServiceHandler implements IServiceOnEventHandler {

  constructor(
        private readonly gpio: IGpio,
        private readonly service: Service,
        private readonly api: API,
  ) {
    this.gpio.writeSync(Gpio.LOW);
    this.gpio.watch((_error, value)=>{
      if(value === Gpio.LOW){
        this.updateUIState(false); 
      } else{
        this.updateUIState(true);
      }
    });
  }

  private updateUIState(isOn: boolean) :void {
    this.service.updateCharacteristic(this.api.hap.Characteristic.On, isOn);
  }

  public async set(value: CharacteristicValue): Promise<void> {
    const switchEnabled: boolean = value as boolean;
    if(switchEnabled){
      await this.gpio.write(Gpio.HIGH);
    } else{
      await this.gpio.write(Gpio.LOW);
    }
  }
    
  public async get(): Promise<CharacteristicValue> {
    return await this.gpio.read();
  }
}