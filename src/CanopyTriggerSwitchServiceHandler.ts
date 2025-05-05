import type { API, CharacteristicValue, Logging, Service } from 'homebridge';
import { IServiceOnEventHandler } from './IServiceOnEventHandler';
import { Gpio } from 'onoff';
import { IGpio } from './gpio/IGpio';

export class CanopyTriggerSwitchServiceHandler implements IServiceOnEventHandler {
  private timeoutHandle: NodeJS.Timeout | null = null;
  constructor(
    private readonly gpio: IGpio,
    private readonly service: Service,
    private readonly api: API,
    private readonly log: Logging,
  ) {
    this.gpio.watch((_error, value)=>{
      if(value === Gpio.HIGH){
        this.updateUIState(true);
        this.startEmulateBounceBack();
      } else{
        this.updateUIState(false);
        this.stopEmulateBounceBack();
      }
    });
    this.gpio.writeSync(Gpio.LOW);
  }
  
  private updateUIState(isOn: boolean) : void {
    this.service.updateCharacteristic(this.api.hap.Characteristic.On, isOn);
  }

  private stopEmulateBounceBack() : void {
    this.log.info(`Stop trigger switch bounce back emulation for gpio ${this.gpio.getPin()}`);
    if(this.timeoutHandle){
      clearTimeout(this.timeoutHandle);
    }
  }

  private startEmulateBounceBack() : void {
    this.log.info(`Start trigger switch emulation bounce back for gpio ${this.gpio.getPin()}`);
    this.timeoutHandle = setTimeout(() => {
      this.gpio.write(Gpio.LOW).catch(err=>{
        this.log.error(`Trigger switch bounce back emulation connected to gpio ${this.gpio.getPin()} failed, root cause: ${err}`);
      });
    }, 200);
  }

  public async set(value: CharacteristicValue): Promise<void> {
    const triggerSwitchisOn: boolean = value as boolean;
    if(triggerSwitchisOn){
      await this.gpio.write(Gpio.HIGH);
    } else{
      await this.gpio.write(Gpio.LOW);
    }
  }

  public async get(): Promise<CharacteristicValue> {
    return await this.gpio.read();
  }
}