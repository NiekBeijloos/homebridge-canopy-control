import type { Logging, PlatformConfig } from 'homebridge';

export type GpioNumber = number;
export type Name = string;

enum ServiceType{
  Switch,
  TriggerSwitch
}

export class ConfigurationParser{
  private serialNumber!: string;
  private application!: string;
  private manufacturer!: string;
  private model!: string;
  private services: Record<ServiceType, Record<Name, GpioNumber>> = {
    [ServiceType.Switch]:{},
    [ServiceType.TriggerSwitch]:{},
  };
  private watchdogTimeout!: number;

  constructor(
    config: PlatformConfig,
        private readonly log: Logging,
  ) {
    this.parseConfiguration(config);
  }

  private throwWhenPropertyIsUndefined(property: unknown, propertyName: string){
    if(!property){
      const error: string = `Expected: ${propertyName}, but not defined in config.schema.json!`;
      this.log.error(error);
      throw new Error(error);
    }
  }

  private throwWhenPropertyIsNotOfType(property: unknown, expectedType:  'string' | 'number' | 'array', propertyName: string) {
    let propertyIsNotOfExpectedType: boolean = false; 
    switch(expectedType){
    case 'number':{
      const value: number = property as number;
      if(Number.isNaN(value)){
        propertyIsNotOfExpectedType = true;
      }
      break;
    }
    case 'array':{
      if(!Array.isArray(property)){
        propertyIsNotOfExpectedType = true;
      }
      break;
    }
    }

    if(propertyIsNotOfExpectedType){
      const error: string = `Expected: ${propertyName} to be of type ${expectedType}, but this is not defined in config.schema.json!`;
      this.log.error(error);
      throw new Error(error);
    }
  }

  private validateProperty(expectedProperty: unknown, expectedType:  'string' | 'number' | 'array', propertyName: string){
    this.throwWhenPropertyIsUndefined(expectedProperty, propertyName);
    this.throwWhenPropertyIsNotOfType(expectedProperty, expectedType, propertyName);
  }

  private recordContainsAttributes(records: Record<ServiceType, Record<Name, GpioNumber>>, nameAttr: string, gpioAttr: GpioNumber) : boolean {
    let recordContainsAttributes: boolean = false;

    for (const service of Object.keys(records) as unknown as ServiceType[]){
      for (const [key, value] of Object.entries(records[service])) {
        if(nameAttr === key || gpioAttr === value){
          recordContainsAttributes = true;
          break;
        }
      }
    }
    return recordContainsAttributes;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private parseSwitches(switches: any, serviceType: ServiceType, propertyName: string): void {
    this.validateProperty(switches, 'array', propertyName);
    for(const mySwitch of switches){
      this.validateProperty(mySwitch.name, 'string', `${propertyName}.name`);
      this.validateProperty(mySwitch.gpio, 'number', `${propertyName}.gpio`);
      if(this.recordContainsAttributes(this.services, mySwitch.name, mySwitch.gpio)) { 
        throw new Error(`${mySwitch.name} or ${mySwitch.gpio} already in use, name and/or gpio can't be used twice; check configuration!`);
      }
      this.services[serviceType][mySwitch.name] = mySwitch.gpio;
    }
  }

  private parseConfiguration(config: PlatformConfig) : void {
    this.log.info('Parsing platform configuration...');

    this.validateProperty(config.serialnumber, 'string', 'serialnumber');
    this.serialNumber = config.serialnumber;
      
    this.validateProperty(config.application, 'string', 'application');
    this.application = config.application;

    this.validateProperty(config.manufacturer, 'string', 'manufacturer');
    this.manufacturer = config.manufacturer;

    this.validateProperty(config.model, 'string', 'model');
    this.model = config.model;

    this.parseSwitches(config.triggerswitches, ServiceType.TriggerSwitch, 'triggerswitches');
    this.parseSwitches(config.switches, ServiceType.Switch, 'switches');

    this.validateProperty(config.watchdogtimeout, 'number', 'watchdogtimeout');
    this.watchdogTimeout = config.watchdogtimeout;
  }

  public getTriggerSwitches() : Record<Name, GpioNumber> {
    return this.services[ServiceType.TriggerSwitch];
  }

  public getSwitches() : Record<Name, GpioNumber> {
    return this.services[ServiceType.Switch];
  }

  public getSerialNumber() : string {
    return this.serialNumber;
  }

  public getApplication() : string{
    return this.application;
  }

  public getManufacturer() : string{
    return this.manufacturer;
  }

  public getModel() : string{
    return this.model;
  }

  public getWatchdogTimeout() : number{
    return this.watchdogTimeout;
  }
}