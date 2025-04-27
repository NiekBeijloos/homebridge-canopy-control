import { API, Characteristic, DynamicPlatformPlugin, Logging, PlatformAccessory, PlatformConfig, Service } from 'homebridge';
import { PLATFORM_NAME, PLUGIN_NAME } from './settings.js';
import { CanopyAccessoryBuilder } from './CanopyAccessoryBuilder.js';
import { ConfigurationParser } from './ConfigurationParser.js';

export class CanopyControlPlatform implements DynamicPlatformPlugin {
  public readonly Service: typeof Service;
  public readonly Characteristic: typeof Characteristic;
  private canopyAccessoryBuilder: CanopyAccessoryBuilder;
  private configurationParser: ConfigurationParser;
  private cachedAccessories: PlatformAccessory[] = []; 

  constructor(
    public readonly log: Logging,
    config: PlatformConfig,
    public readonly api: API,
  ) {
    this.Service = api.hap.Service;
    this.Characteristic = api.hap.Characteristic;
    this.configurationParser = new ConfigurationParser(config, log);
    this.canopyAccessoryBuilder = new CanopyAccessoryBuilder(this.log, this.api, this.configurationParser);

    this.api.on('didFinishLaunching', () => {
      this.unregisterCachedAccessories();
      this.registerCanopyAccessory();
    });
  }

  configureAccessory(accessory: PlatformAccessory) {
    this.cachedAccessories.push(accessory);
  }

  unregisterCachedAccessories(){
    this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, this.cachedAccessories);
  }

  registerCanopyAccessory() {
    const accessory: PlatformAccessory = this.canopyAccessoryBuilder.reset()
      .addCanopyMetaDataService()
      .addCanopySwitchServices()
      .addCanopyTriggerSwitchServices()
      .getResult();
    this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
  }
}