import type { API, Characteristic, DynamicPlatformPlugin, Logging, PlatformAccessory, PlatformConfig, Service } from 'homebridge';
import { PLATFORM_NAME, PLUGIN_NAME } from './settings.js';
import { CanopyAccessoryBuilder } from './CanopyAccessoryBuilder.js';

export class CanopyControlPlatform implements DynamicPlatformPlugin {
  public readonly Service: typeof Service;
  public readonly Characteristic: typeof Characteristic;
  private canopyAccessoryBuilder: CanopyAccessoryBuilder;
  public readonly cachedAccessories: Map<string, PlatformAccessory> = new Map();

  constructor(
    public readonly log: Logging,
    public readonly config: PlatformConfig,
    public readonly api: API,
  ) {
    this.Service = api.hap.Service;
    this.Characteristic = api.hap.Characteristic;
    this.canopyAccessoryBuilder = new CanopyAccessoryBuilder(this.log, this.api, this.config);
    this.log.debug('Finished initializing platform:', this.config.application);

    this.api.on('didFinishLaunching', () => {
      this.log.debug('Executed didFinishLaunching callback');
      this.discoverDevices();
    });
  }

  configureAccessory(accessory: PlatformAccessory) {
    this.log.info('Loading accessory from cache:', accessory.displayName);
    this.cachedAccessories.set(accessory.UUID, accessory);
  }

  discoverDevices() {
    const uuid = this.api.hap.uuid.generate(this.config.serialnumber);
    const cachedAccessory = this.cachedAccessories.get(uuid);
    let accessory : PlatformAccessory;
    if (cachedAccessory) {
      this.log.info('Restoring existing accessory from cache:', cachedAccessory.displayName);
      accessory = this.canopyAccessoryBuilder.reset(cachedAccessory)
        .addCanopyMetaDataService()
        .addCanopySwitchServices()
        .getResult();
    } else {
      const name: string = this.config.application as string;
      this.log.info('Adding new accessory:', name);
      accessory = this.canopyAccessoryBuilder.reset()
        .addCanopyMetaDataService()
        .addCanopySwitchServices()
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
