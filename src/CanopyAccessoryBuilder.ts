import type { API, Logging, PlatformAccessory, Service } from 'homebridge';
import { CanopySwitchServiceHandler } from './CanopySwitchServiceHandler.js';
import { IServiceOnEventHandler } from './IServiceOnEventHandler';
import { CanopyOutletServiceHandler } from './CanopyOutletServiceHandler.js';
import { ConfigurationParser } from './ConfigurationParser.js';

export class CanopyAccessoryBuilder{
  private accessory!: PlatformAccessory;
  constructor(
    private readonly log: Logging,
    private readonly api: API,
    private readonly configurationParser: ConfigurationParser,
  ) {
  }

  public reset(base?: PlatformAccessory): this{
    if(base == null){
      this.log.info('Building new accessory: ', this.configurationParser.getApplication());
      const uuid = this.api.hap.uuid.generate(this.configurationParser.getSerialNumber());
      this.accessory = new this.api.platformAccessory(this.configurationParser.getApplication(), uuid);
    } else{
      this.accessory = base;
    }
    return this;
  }

  private setNameCharachteristic(service: Service, name: string){
    service.setCharacteristic(this.api.hap.Characteristic.Name, name);
    service.addOptionalCharacteristic(this.api.hap.Characteristic.ConfiguredName);
    service.setCharacteristic(this.api.hap.Characteristic.ConfiguredName, name);
  }

  private setOnCharachteristic(service: Service, onEventHandler: IServiceOnEventHandler) {
    service.getCharacteristic(this.api.hap.Characteristic.On)
      .onSet(onEventHandler.set.bind(onEventHandler))
      .onGet(onEventHandler.get.bind(onEventHandler));
    service.updateCharacteristic(this.api.hap.Characteristic.On, false);
  }

  public addCanopySwitchServices(): this {
    if(!this.accessory){
      this.log.error('Adding switch services to canopy accessory failed; accessory is null');
      return this;
    }
    for(const [name, gpio] of Object.entries((this.configurationParser.getSwitches()))){
      const service = this.accessory.getService(name) || this.accessory.addService(this.api.hap.Service.Switch, name, name);
      this.setNameCharachteristic(service, name);
      this.setOnCharachteristic(service, new CanopySwitchServiceHandler(this.log, gpio, name));
      this.log.info(`Added ${service.displayName} Switch Service with ON Characteristic connected to gpio ${gpio} to canopy Accessory`);
    }
    return this;
  }

  public addCanopyButtonServices(): this {
    if(!this.accessory){
      this.log.error('Adding button services to canopy accessory failed; accessory is null');
      return this;
    }
    
    for(const [name, gpio] of Object.entries((this.configurationParser.getButtons()))){
      const service = this.accessory.getService(name) || this.accessory.addService(this.api.hap.Service.Outlet, name, name);
      this.setNameCharachteristic(service, name);
      this.setOnCharachteristic(service, new CanopyOutletServiceHandler(this.log, gpio, service, this.api));
      this.log.info(`Added ${service.displayName} Outlet Service with ON Characteristic connected to gpio ${gpio} to canopy Accessory`);
    }
    
    return this;
  }

  public addCanopyMetaDataService(): this {
    if(!this.accessory){
      this.log.error('Adding meta data services to canopy accessory failed; accessory is null');
      return this;
    }

    this.accessory.getService(this.api.hap.Service.AccessoryInformation)!
      .setCharacteristic(this.api.hap.Characteristic.Manufacturer, this.configurationParser.getManufacturer())
      .setCharacteristic(this.api.hap.Characteristic.Model, this.configurationParser.getModel())
      .setCharacteristic(this.api.hap.Characteristic.SerialNumber, this.configurationParser.getSerialNumber());
    this.log.info('Added Metadata Service to canopy accessory');
    
    return this;
  }

  public getResult() : PlatformAccessory {
    return this.accessory;
  }
}