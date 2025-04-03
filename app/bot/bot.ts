import {
   Order,
   PaymentMethod,
   ProductType,
   TonTransaction,
} from "@prisma/client";
import { Bot } from "grammy";
import { InlineKeyboard } from "grammy";
import { ordrIdMssgFnc, prdctCfrmtn, prdctDtlMssg } from "bot/src/messages";

export const bot = new Bot(process.env.BOT_TOKEN || "");

// scripts
export async function orderScript(
   buyerId: number,
   currency: PaymentMethod,
   product: ProductType,
   amount: number,
   receiver: string,
   total: number,
   orderId: number
) {
   const clientMessage = `${ordrIdMssgFnc(orderId)} <blockquote>${prdctDtlMssg(
      product,
      amount,
      receiver,
      total,
      currency
   )}</blockquote> \n ${prdctCfrmtn()}`;
   try {
      if (currency === "TON") {
         return true;
      } else {
         await bot.api.sendMessage(buyerId, clientMessage, {
            reply_markup: new InlineKeyboard()
               .text("Tassykla ✅", "acceptOrder_" + orderId)
               .row()
               .text("Goýbolsun ❌", "cancelOrder_" + orderId),
            parse_mode: "HTML",
         });

         return true;
      }
   } catch (error) {
      console.error(`SMS gitmedi: ${error}`);
      return false;
   }
}
export async function trnsctnScript(id: number, message: string) {
   await bot.api.sendMessage(id, message);
}

interface OrderDetails extends Order {
   tonTransaction: TonTransaction | null;
}

export async function noticeAdmins(order: OrderDetails) {
   return order;
}
export async function noticeClient(transaction: string) {
   return transaction;
}
