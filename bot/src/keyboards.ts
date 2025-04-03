import { Order } from "@prisma/client";
import { InlineKeyboard } from "grammy";

// keyboard generators
export function dlvrOrdrKybrd(order: Order) {
    const completeOrder = new InlineKeyboard()
       .text("Kabul Et ✅", "deliverOrder_" + order.id)
       .row()
       .text("Ýatyr ❌", "declineOrder_" + order.id)
       .row()
       .copyText(order.receiver, order.receiver);
    return completeOrder;
 }
 export function cnclAddSumBtnn() {
    return new InlineKeyboard().text("Goýbolsun ✖️", "declineAdd");
 }