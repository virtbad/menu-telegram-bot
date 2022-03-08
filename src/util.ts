import { Menu, MenuLabel, MenuPrice } from "./types/Menu.types";

/**
 * Function to get a menu represented as a string
 *
 * @param menu menu to be represented
 *
 * @returns string representation
 */

export const menuToText = (menu: Menu): string => {
  const label: string = menu.label !== MenuLabel.NO_LABEL ? `  _(${menu.label === MenuLabel.VEGAN ? "Vegan" : menu.label === MenuLabel.VEGETARIAN ? "Vegetarisch" : "One Climate"})_` : "";
  let menuText: string = "";
  menuText += `*${escapeMarkdownCharacters(menu.title)}* ${escapeMarkdownCharacters(label, ["_"])}`;
  menuText += "\n";
  menuText += `${escapeMarkdownCharacters(menu.description)}`;
  menuText += "\n";
  menuText += menu.prices
    .map((price: MenuPrice) => {
      return `*${escapeMarkdownCharacters(price.tag)}*: ${escapeMarkdownCharacters(price.price.toFixed(2))}`;
    })
    .join(" \\| ");

  return menuText;
};

/**
 * Function to replace all illegal characters for markdown v2 in telegram
 *
 * @param text text to replace characters
 *
 * @param except characters which shouldn't be escaped
 *
 * @returns escaped text
 */

export const escapeMarkdownCharacters = (text: string, except: Array<string> = []) => {
  let escapedText = text;
  if (!except.includes("_")) escapedText = escapedText.replace(/_/g, "\\_");
  if (!except.includes("*")) escapedText = escapedText.replace(/\*/g, "\\*");
  if (!except.includes("[")) escapedText = escapedText.replace(/\[/g, "\\[");
  if (!except.includes("]")) escapedText = escapedText.replace(/\]/g, "\\]");
  if (!except.includes("(")) escapedText = escapedText.replace(/\(/g, "\\(");
  if (!except.includes(")")) escapedText = escapedText.replace(/\)/g, "\\)");
  if (!except.includes("~")) escapedText = escapedText.replace(/~/g, "\\~");
  if (!except.includes("`")) escapedText = escapedText.replace(/`/g, "\\`");
  if (!except.includes(">")) escapedText = escapedText.replace(/>/g, "\\>");
  if (!except.includes("#")) escapedText = escapedText.replace(/#/g, "\\#");
  if (!except.includes("+")) escapedText = escapedText.replace(/\+/g, "\\+");
  if (!except.includes("-")) escapedText = escapedText.replace(/-/g, "\\-");
  if (!except.includes("=")) escapedText = escapedText.replace(/=/g, "\\=");
  if (!except.includes("|")) escapedText = escapedText.replace(/\|/g, "\\|");
  if (!except.includes("{")) escapedText = escapedText.replace(/\{/g, "\\{");
  if (!except.includes("}")) escapedText = escapedText.replace(/\}/g, "\\}");
  if (!except.includes(".")) escapedText = escapedText.replace(/\./g, "\\.");
  if (!except.includes("!")) escapedText = escapedText.replace(/!/g, "\\!");

  return escapedText;
};

/**
 * Function to convert the menus from a given date to a message string
 *
 * @param menus menus of the date
 *
 * @param date date
 *
 * @returns string with the menus
 */

export const getMenuDateText = (menus: Array<Menu>, date?: Date): string => {
  const menuDate: Date = date || new Date(menus.find(({ date }) => date)?.date || Date.now());
  const headString: string = `*__Menüs vom ${menuDate.toLocaleDateString("de", { weekday: "long" })}, ${menuDate.toLocaleDateString("de", { dateStyle: "long" })}:__*\n\n`;
  let menuText: string = escapeMarkdownCharacters(headString, ["*", "_"]);

  if (menus.length > 0) menuText += menus.map(menuToText).join("\n\n");
  else menuText += "*Die Mensa hat heute geschlossen*";
  return menuText;
};

/**
 * Function to convert a potential axios error to a string message
 *
 * @param e potential error
 *
 * @returns string representation
 */

export const convertAxiosErrorString = (e: any): string => {
  return `${e?.message || "Unknown message"}\n${e?.response?.data?.message || "No error message"}`;
};
