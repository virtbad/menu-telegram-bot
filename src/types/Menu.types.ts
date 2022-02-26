export interface Menu {
  /**
   * Uuid of the menu
   */

  id: string;

  /**
   * Title of the menu
   */

  title: string;

  /**
   * Description of the menu
   */

  description: string;

  /**
   * Unix timestamp of the date
   */

  date: number;

  /**
   * Menu channel
   */

  channel: number;

  /**
   * Label of the menu
   */

  label: MenuLabel;

  /**
   * Different prices for the menu
   */

  prices: Array<MenuPrice>;

  /**
   * Votes of the menu
   */

  voteBalance: number;
}

export interface MenuPrice {
  /**
   * Group of the menu price
   */

  tag: string;

  /**
   * Price for the price group
   */

  price: number;
}

export enum MenuLabel {
  NO_LABEL = 0,
  VEGETARIAN = 1,
  VEGAN = 2,
  ONE_CLIMATE = 3,
}
