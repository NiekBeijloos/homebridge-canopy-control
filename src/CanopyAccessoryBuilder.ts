import { type API, type Logging, type PlatformAccessory, type Service } from 'homebridge';
import { CanopySwitchServiceHandler } from './CanopySwitchServiceHandler.js';
import { IServiceOnEventHandler } from './IServiceOnEventHandler';
import { CanopyTriggerSwitchServiceHandler } from './CanopyTriggerSwitchServiceHandler.js';
import { ConfigurationParser } from './ConfigurationParser.js';
import { GpioLogDecorator } from './gpio/GpioLogDecorator.js';
import { IGpio } from './gpio/IGpio.js';
import { GpioHighWatchdogDecorator } from './gpio/GpioHighWatchdogDecorator.js';
import { MyGpio } from './gpio/MyGpio.js';

export class CanopyAccessoryBuilder{
  private accessory!: PlatformAccessory;
  constructor(
    private readonly log: Logging,
    private readonly api: API,
    private readonly configurationParser: ConfigurationParser,
  ) {
  }

  public reset(): this {
    this.log.info('Building new accessory: ', this.configurationParser.getApplication());
    const uuid = this.api.hap.uuid.generate(this.configurationParser.getSerialNumber());
    this.accessory = new this.api.platformAccessory(this.configurationParser.getApplication(), uuid);

    return this;
  }

  private setNameCharacteristic(service: Service, name: string){
    service.setCharacteristic(this.api.hap.Characteristic.Name, name);
    service.addOptionalCharacteristic(this.api.hap.Characteristic.ConfiguredName);
    service.setCharacteristic(this.api.hap.Characteristic.ConfiguredName, name);
  }

  private setOnCharacteristic(service: Service, onEventHandler: IServiceOnEventHandler) {
    service.getCharacteristic(this.api.hap.Characteristic.On)
      .onSet(onEventHandler.set.bind(onEventHandler))
      .onGet(onEventHandler.get.bind(onEventHandler));
  }
  
  public addCanopySwitchServices(): this {
    if(!this.accessory){
      this.log.error('Adding Switch services to canopy accessory failed; accessory is null');
      return this;
    }

    for(const [name, gpioPin] of Object.entries(this.configurationParser.getSwitches())){
      const service = this.accessory.addService(this.api.hap.Service.Outlet, name, name);
      this.setNameCharacteristic(service, name);
      const gpio: IGpio = 
        new GpioHighWatchdogDecorator(
          new GpioLogDecorator(this.log, 
            new MyGpio(gpioPin, this.log), name), this.configurationParser.getWatchdogTimeout(), this.log);
      this.setOnCharacteristic(service, new CanopySwitchServiceHandler(gpio, service, this.api));
      this.log.info(`Added ${service.displayName} Switch Service connected to gpio ${gpioPin} to canopy Accessory`);
    }

    return this;
  }

  public addCanopyTriggerSwitchServices(): this {
    if(!this.accessory){
      this.log.error('Adding Trigger Switch services to canopy accessory failed; accessory is null');
      return this;
    }
    
    for(const [name, gpioPin] of Object.entries((this.configurationParser.getTriggerSwitches()))){
      const service = this.accessory.addService(this.api.hap.Service.Outlet, name, name);
      this.setNameCharacteristic(service, name);
      const gpio: IGpio = 
        new GpioLogDecorator(this.log, 
          new MyGpio(gpioPin, this.log), name);
      this.setOnCharacteristic(service, new CanopyTriggerSwitchServiceHandler(gpio, service, this.api, this.log));
      this.log.info(`Added ${service.displayName} Trigger Switch Service connected to gpio ${gpioPin} to canopy Accessory`);
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