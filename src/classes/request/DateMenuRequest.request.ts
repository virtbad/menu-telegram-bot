import { apiUrl } from "../../config";
import { Menu } from "../../types/Menu.types";
import { Request } from "./Request.request";

/**
 * Request to get the menus for a specific date
 */

export class DateMenuRequest extends Request<Array<Menu>> {
  constructor() {
    super(`${apiUrl}/menu/date`, "GET");
  }

  public async execute(date?: number): Promise<Menu[]> {
    return await this.sendRequest({ params: !!date ? { date: date } : undefined });
  }
}
