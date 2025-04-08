
import { Bot } from "grammy";
import { InlineKeyboard } from "grammy";
import {
   ordrDlvrng,
   ordrIdMssgFnc,
   prdctCfrmtn,
   prdctDtlMssg,
} from "bot/src/messages";
import {  ordrMsgEdtStts, statusIcons } from "bot/src/settings";
import { dlvrOrdrKybrd } from "bot/src/keyboards";
import { Order, PaymentMethod, Product, ProductType, TonTransaction } from "../prisma/prismaSett";

export const bot = new Bot(process.env.BOT_TOKEN || "");
export const adminidS = [process.env.PALWAN_ID || 0, process.env.HAJY_ID || 0]

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
               .text("Tassykla " + statusIcons.yes[3], "acceptOrder_" + orderId)
               .row()
               .text(
                  "Goýbolsun " + statusIcons.no[3],
                  "cancelOrder_" + orderId
               ),
            parse_mode: "HTML",
         });

         return true;
      }
   } catch (error) {
      console.error(`SMS gitmedi: ${error}`);
      return false;
   }
}

interface OrderDetails extends Order {
   tonTransaction: TonTransaction | null;
   product: Product;
}
export async function noticeAdmins(order: OrderDetails) {
   console.log('adminds:',adminidS);
   
   const mssgIds: number[] = [];
   console.log("here2");

   for (const adminid of adminidS) {
      console.log(adminid);
      const data = await bot.api.sendMessage(
         adminid,
         `${ordrIdMssgFnc(order.id)} ${prdctDtlMssg(
            order.product.name,
            order.product.amount,
            order.receiver,
            order.payment === "TMT"
               ? order.product.priceTMT
               : order.product.priceUSDT,
            order.payment,
            order.userId
         )}`,
         {
            reply_markup: dlvrOrdrKybrd(order),
            parse_mode: "HTML",
         }
      );
      mssgIds.push(data.message_id);
   }
   const clientMessage = `${ordrIdMssgFnc(order.id)} <blockquote>${prdctDtlMssg(
      order.product.name,
      order.product.amount,
      order.receiver,
      order.tonTransaction?.price || 0,
      order.payment
   )}</blockquote> \n ${ordrDlvrng(order.courierid || 0)}`;
   await bot.api.sendMessage(order.userId, clientMessage, {
      parse_mode: "HTML",
   });

   ordrMsgEdtStts.set(order.id, { mssgIds: mssgIds });
}

export async function sendMessages(ids: string[], message: string) {
   ids.map(async (id) => {
      bot.api.sendMessage(id, message);
   });
}
