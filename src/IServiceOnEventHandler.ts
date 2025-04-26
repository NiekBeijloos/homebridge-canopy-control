import type { CharacteristicValue } from 'homebridge';

export interface IServiceOnEventHandler {
  set(value: CharacteristicValue) : Promise<void>;
  get(): Promise<CharacteristicValue>;
}