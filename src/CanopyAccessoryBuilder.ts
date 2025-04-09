import type { API, Logging, PlatformAccessory, PlatformConfig } from 'homebridge';
import { CanopySwitchServiceHandler } from './ConopySwitchServiceHandler.js';

export class CanopyAccessoryBuilder{
  private accessory!: PlatformAccessory;
  constructor(
    private readonly log: Logging,
    private readonly api: API,
    private readonly config: PlatformConfig,
  ) {
  }

  public reset(base?: PlatformAccessory): this{
    if(base == null){
      const uuid = this.api.hap.uuid.generate(this.config.serialnumber);
      this.accessory = new this.api.platformAccessory(this.config.application as string, uuid);
    } else{
      this.accessory = base;
    }
    return this;
  }

  public addCanopySwitchServices(): this {
    if(!this.accessory){
      this.log.error('Adding button services to canopy accessory failed; accessory is null');
      return this;
    }
    for(const button of this.config.buttons){
      const service = this.accessory.getService(button.name) || this.accessory.addService(this.api.hap.Service.Switch, button.name, button.name);
      service.setCharacteristic(this.api.hap.Characteristic.Name, button.name);
      const onCharacteristicHandler: CanopySwitchServiceHandler = new CanopySwitchServiceHandler(this.log, button.gpio);
      service.getCharacteristic(this.api.hap.Characteristic.On)
        .onSet(onCharacteristicHandler.set.bind(onCharacteristicHandler))
        .onGet(onCharacteristicHandler.get.bind(onCharacteristicHandler));
      service.updateCharacteristic(this.api.hap.Characteristic.On, false);
      this.log.info(`Added ${service.displayName} Switch Service with ON Characteristic connected to: ${button.gpio} to canopy Accessory`);
    }
    return this;
  }

  public addCanopyToggleButtonServices(): this {
    return this;
  }

  public addCanopyMetaDataService(): this {
    if(!this.accessory){
      this.log.error('Adding meta data services to canopy accessory failed; accessory is null');
      return this;
    }
    const service = this.accessory.getService(this.api.hap.Service.AccessoryInformation)!
      .setCharacteristic(this.api.hap.Characteristic.Manufacturer, this.config.manufacturer)
      .setCharacteristic(this.api.hap.Characteristic.Model, this.config.model)
      .setCharacteristic(this.api.hap.Characteristic.SerialNumber, this.config.serialnumber);
    this.log.info(`Added ${service.name} meta data service to canopy accessory`);
    return this;
  }

  public getResult() : PlatformAccessory {
    return this.accessory;
  }
}