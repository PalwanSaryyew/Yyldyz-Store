import { PaymentMethod, ProductType, SummUpdate, User } from "@prisma/client";
import { Bot } from "grammy";

// envs
export const bot = new Bot(process.env.BOT_TOKEN || "");
export const adminidS = [process.env.PALWAN || "", process.env.HAJY || ""];
interface SumAddState {
   mssgId: number;
   walNum: User["walNum"];
   crrncy: PaymentMethod | "";
   sum: SummUpdate["sum"];
}
interface OrdrMsgEdtSt {
   mssgIds: number[];
}
export const reasonStates = new Map();
export const sumAddStates: Map<number | undefined, SumAddState> = new Map();
export const ordrMsgEdtStts: Map<number, OrdrMsgEdtSt> = new Map();
// functions
// random number genrator
export function rndmNmrGnrtr(l: number): string {
   let result = "";
   for (let i = 0; i < l; i++) {
      result += Math.floor(Math.random() * 10);
   }
   return result;
}
// product name returner
export function prdctDsplyNme(
   name: ProductType
): "Jeton" | "Ýyldyz" | "Tg Premium" | "UC" {
   return name === "jtn"
      ? "Jeton"
      : name === "star"
      ? "Ýyldyz"
      : name === "tgprem"
      ? "Tg Premium"
      : name === "uc"
      ? "UC"
      : name;
}

export const editSummComand = "eylenbeylen";

export const statusIcons = {
   yes: ["✔️", "☑️", "✅", "🟢"],
   no: ["❎", "✖️", "❌", "🔴", "⭕"],
   care: ["❕", "ℹ️", "❗", "‼️", "⁉️", "🟡", "⚠️", "🟠"],
   wait: ['📦📨⌛🚫⛔🕥🚩⚡🛒📌📍⏳⌚⏱️⏲️'],
};
