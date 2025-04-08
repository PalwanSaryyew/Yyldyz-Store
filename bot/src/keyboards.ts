import { Order } from "@prisma/client";
import { InlineKeyboard } from "grammy";
import { statusIcons } from "./settings";

// keyboard generators
export function dlvrOrdrKybrd(order: Order) {
    const completeOrder = new InlineKeyboard()
       .text("Kabul Et "+statusIcons.yes[3], "deliverOrder_" + order.id)
       .row()
       .text("Ýatyr "+statusIcons.no[3], "declineOrder_" + order.id)
       .row()
       .copyText(order.receiver, order.receiver);
    return completeOrder;
 }
 export function cnclAddSumBtnn() {
    return new InlineKeyboard().text("Goýbolsun "+statusIcons.care[7], "declineAdd");
 }