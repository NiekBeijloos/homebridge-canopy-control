import { BinaryValue, Gpio, ValueCallback } from 'onoff';
import { IGpio } from './IGpio';
import { Logger } from 'homebridge';

export class GpioHighWatchdogDecorator implements IGpio {
  private timeoutHandle: NodeJS.Timeout | undefined;
  constructor(
    private readonly gpio: IGpio,
    private readonly timeout: number,
    private readonly logging: Logger,
  ) {
  }

  public getPin(): number {
    return this.gpio.getPin();
  }

  public read(): Promise<BinaryValue>{
    return this.gpio.read();
  }

  public watch(callback: ValueCallback): void {
    this.gpio.watch(callback);
  }

  public readSync(): BinaryValue {
    return this.gpio.readSync();
  }

  private stopWatchdog() : void {
    this.logging.info(`Stopping watchdog that monitored gpio ${this.gpio.getPin()}`);
    clearTimeout(this.timeoutHandle);
  }

  private startWatchdog() : void {
    this.logging.info(`Starting watchdog to monitor gpio ${this.gpio.getPin()} with timeout ${this.timeout}`);
    this.timeoutHandle = setTimeout(()=> {
      this.logging.info(`Watchdog triggered that monitors gpio ${this.gpio.getPin()}`);
      this.gpio.write(Gpio.LOW).catch(err=>{
        this.logging.error(`Wachtdog failed to set gpio ${this.gpio.getPin()} LOW, root cause: ${err}`);
      });
    }, this.timeout);
  }

  public writeSync(value: BinaryValue): void {
    this.gpio.writeSync(value);
    this.stopWatchdog();
    if(value === Gpio.HIGH){
      this.startWatchdog();
    }
  }

  public async write(value: BinaryValue) : Promise<void> {
    await this.gpio.write(value);
    this.stopWatchdog();
    if(value === Gpio.HIGH){
      this.startWatchdog();
    }
  }
}