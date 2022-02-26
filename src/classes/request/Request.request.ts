import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { Logger } from "../Logger.class";

/**
 * Abstract base request class
 */

export abstract class Request<T extends any> {
  /**
   * Url of the request
   */

  public readonly url: string;

  /**
   * Request type
   */

  public readonly type: "GET" | "POST" | "DELETE" | "PUT";

  constructor(url: string, type: "GET" | "POST" | "DELETE" | "PUT") {
    this.url = url;
    this.type = type;
  }

  public abstract execute(): Promise<T>;

  /**
   * Send the request
   *
   * @param config request config
   *
   * @returns data of provided type
   */

  protected async sendRequest(config: AxiosRequestConfig = {}): Promise<any> {
    Logger.request("Sending request");
    let data: AxiosResponse;
    switch (this.type) {
      case "DELETE":
        data = await axios.delete(this.url, config);
        return data.data as T;
      case "PUT":
        data = await axios.put(this.url, config);
        return data.data as T;
      case "POST":
        data = await axios.post(this.url, config);
        return data.data as T;
      default:
        data = await axios.get(this.url, config);
        return data.data as T;
    }
  }
}
