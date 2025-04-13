import type { API, Characteristic, DynamicPlatformPlugin, Logging, PlatformAccessory, PlatformConfig, Service } from 'homebridge';
import { PLATFORM_NAME, PLUGIN_NAME } from './settings.js';
import { CanopyAccessoryBuilder } from './CanopyAccessoryBuilder.js';
import { ConfigurationParser } from './ConfigurationParser.js';

export class CanopyControlPlatform implements DynamicPlatformPlugin {
  public readonly Service: typeof Service;
  public readonly Characteristic: typeof Characteristic;
  private canopyAccessoryBuilder: CanopyAccessoryBuilder;
  private configurationParser: ConfigurationParser;
  public readonly cachedAccessories: Map<string, PlatformAccessory> = new Map();
  
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
      this.discoverDevices();
    });
  }

  configureAccessory(accessory: PlatformAccessory) {
    this.log.info('Loading accessory from cache:', accessory.displayName);
    this.cachedAccessories.set(accessory.UUID, accessory);
  }

  discoverDevices() {
    const uuid = this.api.hap.uuid.generate(this.configurationParser.getSerialNumber());
    const cachedAccessory = this.cachedAccessories.get(uuid);
    let accessory : PlatformAccessory;
    if (cachedAccessory) {
      this.log.info('Restoring existing accessory from cache:', cachedAccessory.displayName);
      accessory = this.canopyAccessoryBuilder.reset(cachedAccessory)
        .addCanopyMetaDataService()
        .addCanopySwitchServices()
        .addCanopyButtonServices()
        .getResult();
    } else {
      accessory = this.canopyAccessoryBuilder.reset()
        .addCanopyMetaDataService()
        .addCanopySwitchServices()
        .addCanopyButtonServices()
        .getResult();
      this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
    }
    this.cachedAccessories.set(accessory.UUID, accessory);
    this.RemovalAllCachedAccessoriesExcept(accessory.UUID);
  }

  private RemovalAllCachedAccessoriesExcept(uuidToKeep: string){
    for (const [uuid, accessory] of this.cachedAccessories) {
      if (uuid !== uuidToKeep) {
        this.log.info('Removing existing accessory from cache:', accessory.displayName);
        this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
        this.cachedAccessories.delete(uuid);
      }
    }
  }
}
