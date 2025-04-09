import type { CharacteristicValue, Logging } from 'homebridge';
import { CanopySwitchServiceHandler } from './ConopySwitchServiceHandler';

export type GpioNumber = number;

export class CanopyToggleButtonServiceHandler {

  private canopySwitchServiceHandler: CanopySwitchServiceHandler;

  constructor(
        private readonly log: Logging,
        private readonly GpioPin: GpioNumber,
  ) {
    this.canopySwitchServiceHandler = new CanopySwitchServiceHandler(log, GpioPin);
  }
  
  public async set(value: CharacteristicValue) {
    const set: boolean = value as boolean;
    if(set){
      await this.canopySwitchServiceHandler.set(value);
      //set timer to do: service.updateCharacteristic(this.api.hap.Characteristic.On, false);
    }else{
      await this.canopySwitchServiceHandler.set(value);
    }
  }
    
  public async get(): Promise<CharacteristicValue> {
    return await this.canopySwitchServiceHandler.get();
  }
}