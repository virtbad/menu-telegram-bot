/**
 * Integrated logger class
 */

export class Logger {
  /**
   * Integrated error logger
   *
   * @param args log output
   *
   * @returns void
   */

  public static error(...args: Array<any>): void {
    const prefix: string = "[\u001b[31mError\u001b[37m]";
    console.log(prefix, ...args);
  }

  /**
   * Integrated event logger
   *
   * @param args log output
   *
   * @returns void
   */

  public static event(...args: Array<any>): void {
    const prefix: string = "[\u001b[32mEvent\u001b[37m]";
    console.log(prefix, ...args);
  }

  /**
   * Integrated info logger
   *
   * @param args log output
   *
   * @returns void
   */

  public static info(...args: Array<any>): void {
    const prefix: string = "[\u001b[34mInfo\u001b[37m]";
    console.log(prefix, ...args);
  }

  /**
   * Integrated warning logger
   *
   * @param args log output
   *
   * @returns void
   */

  public static warning(...args: Array<any>): void {
    const prefix: string = "[\u001b[33mWarning\u001b[37m]";
    console.log(prefix, ...args);
  }

  /**
   * Integrated request logger
   *
   * @param args log output
   *
   * @returns void
   */

  public static request(...args: Array<any>): void {
    const prefix: string = "[\u001b[35mRequest\u001b[37m]";
    console.log(prefix, ...args);
  }

  /**
   * Integrated command logger
   *
   * @param args log output
   *
   * @return void
   */

  public static command(...args: Array<any>): void {
    const prefix: string = "[\u001b[36mCommand\u001b[37m]";
    console.log(prefix, ...args);
  }

  /**
   * Integrated logger
   *
   * @param args log output
   *
   * @returns void
   */

  public static log(...args: Array<any>): void {
    const prefix: string = "[\u001b[34mLog\u001b[37m]";
    console.log(prefix, ...args);
  }
}
