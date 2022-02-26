import { apiUrl } from "../../config";
import { Menu } from "../../types/Menu.types";
import { Request } from "./Request.request";

/**
 * Request to get all available upcoming menus
 */

export class UpcomingMenusRequest extends Request<Array<Menu>> {
  constructor() {
    super(`${apiUrl}/menu/upcoming`, "GET");
  }

  public async execute(): Promise<Menu[]> {
    return await this.sendRequest();
  }
}
