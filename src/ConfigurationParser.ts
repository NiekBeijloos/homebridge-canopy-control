import type { Logging, PlatformConfig } from 'homebridge';

export type GpioNumber = number;
export type Name = string;

export class ConfigurationParser{
  private serialNumber!: string;
  private application!: string;
  private manufacturer!: string;
  private model!: string;
  private buttonMap: Record<Name, GpioNumber> = {};
  private switchMap: Record<Name, GpioNumber> = {};

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

    this.validateProperty(config.buttons, 'array', 'buttons');
    for(const myButton of config.buttons){
      this.validateProperty(myButton.name, 'string', 'button.name');
      this.validateProperty(myButton.gpio, 'number', 'button.gpio');
      this.buttonMap[myButton.name] = myButton.gpio;
    }

    this.validateProperty(config.switches, 'array', 'switches');
    for(const mySwitch of config.switches){
      this.validateProperty(mySwitch.name, 'string', 'switch.name');
      this.validateProperty(mySwitch.gpio, 'number', 'switch.gpio');
      this.switchMap[mySwitch.name] = mySwitch.gpio;
    }
  }

  public getButtons() : Record<Name, GpioNumber> {
    return this.buttonMap;
  }

  public getSwitches() : Record<Name, GpioNumber> {
    return this.switchMap;
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
}