import { InlineKeyboard } from "grammy";
import { prisma } from "./prisma/prismaSett";
import { adminidS, bot } from "./src/settings";
import { PaymentMethod, SummUpdate, User } from "@prisma/client";
import { err_6, err_7 } from "./src/errCodes";
import { adminValid, chatIdV, userValid, validator } from "./src/validators";
import {
   hspMsg,
   ordrCmltdMssgFnc,
   ordrDclngMssgFnc,
   ordrDlvrng,
   ordrIdMssgFnc,
   prdctDtlMssg,
   sspcsCaseMs,
} from "./src/messages";
import { cnclAddSumBtnn, dlvrOrdrKybrd } from "./src/keyboards";
// holder states
interface SumAddState {
   mssgId: number;
   walNum: User["walNum"];
   crrncy: PaymentMethod | "";
   sum: SummUpdate["sum"];
}
interface OrdrMsgEdtSt {
   mssgIds: number[];
}
const reasonStates = new Map();
const sumAddStates: Map<number | undefined, SumAddState> = new Map();
const ordrMsgEdtStts: Map<number, OrdrMsgEdtSt> = new Map();

/* start command */
bot.command("start", async (ctx) => {
   const userID = ctx.from?.id;
   // çreating user to do geting message permission
   const user = await userValid(userID, true);
   if ("error" in user) {
      return ctx.reply(user.mssg + " \n Täzeden synanşyň /start");
   }

   ctx.reply("Söwda başlamak üçin aşakdaky düwmä basyň", {
      reply_markup: new InlineKeyboard().url(
         "Başla",
         "https://t.me/officialstarstorebot/str"
      ),
   });
});
// hasap command
bot.command("hasap", async (ctx) => {
   const userID = ctx.from?.id;
   // geting user
   const user = await userValid(userID);
   if ("error" in user) {
      // user errMess tipinde bolsa
      return ctx.reply(
         user.mssg +
            " \n Täzeden synanşyň /hasap \n ýada /start berip boty başladyň"
      );
   }
   // user User tipinde bolsa
   ctx.reply(hspMsg(user.walNum, user.sumTmt, user.sumUsdt), {
      reply_markup: new InlineKeyboard().copyText(user.walNum, user.walNum),
      parse_mode: "HTML",
   });
});
// if order aççepted by the çlient
bot.callbackQuery(/acceptOrder_(.+)/, async (ctx) => {
   const orderId = parseInt(ctx.match[1]);
   const clntID = ctx.from.id;

   //caht id comes ?
   const chatId = chatIdV(clntID);
   if (chatId.error) {
      return await ctx.answerCallbackQuery({
         text: chatId.mssg,
         show_alert: true,
      });
   }
   // validates and turnes order details
   const order = await validator(orderId, ["pending"], "accepted");
   if ("error" in order) {
      return await ctx.answerCallbackQuery({
         text: order.mssg,
         show_alert: true,
      });
   }
   // order belongs to ovner of wallet ?
   if (order.userId !== clntID.toString()) {
      return await ctx.answerCallbackQuery({
         text: "Sargydyň eyesi siz däl",
         show_alert: true,
      });
   }
   // preparing messages
   const ordIdMssg = ordrIdMssgFnc(order.id);
   const clntmssg = "✔️ Sargydyňyz mümkin bolan iň gysga wagtda gowşurylar.";
   try {
      // sending messages to admins and collecting messages ids orderly
      const mssgIds: number[] = [];
      for (const adminid of adminidS) {
         const data = await bot.api.sendMessage(
            adminid,
            `${ordIdMssg} ${prdctDtlMssg(
               order.product.name,
               order.product.amount,
               order.receiver,
               order.payment === "TMT"
                  ? order.product.priceTMT
                  : order.product.priceUSDT,
               order.payment,
               ctx.from.id,
               ctx.from.first_name
            )}`,
            {
               reply_markup: dlvrOrdrKybrd(order),
               parse_mode: "HTML",
            }
         );
         mssgIds.push(data.message_id);
      }
      ordrMsgEdtStts.set(orderId, { mssgIds: mssgIds });

      await ctx.editMessageText(
         `${ordIdMssg} <blockquote expandable>${prdctDtlMssg(
            order.product.name,
            order.product.amount,
            order.receiver,
            order.payment === "TMT"
               ? order.product.priceTMT
               : order.product.priceUSDT,
            order.payment
         )}</blockquote> \n ${clntmssg}`,
         { parse_mode: "HTML" }
      );
   } catch (error) {
      console.error("SMS ERROR::", error);
      await ctx.answerCallbackQuery({
         text: "Sargyt kabul edilyarka yalnyslyk doredi.",
         show_alert: true,
      });
   }
});
// if order çançelled by client
bot.callbackQuery(/cancelOrder_(.+)/, async (ctx) => {
   const orderId = parseInt(ctx.match[1]);
   const clntID = ctx.from.id;

   //caht id comes ?
   const chatId = chatIdV(clntID);
   if (chatId.error) {
      return await ctx.answerCallbackQuery({
         text: chatId.mssg,
         show_alert: true,
      });
   }
   // validates and turnes order details
   const order = await validator(orderId, ["pending"], "cancelled");
   if ("error" in order) {
      return await ctx.answerCallbackQuery({
         text: order.mssg,
         show_alert: true,
      });
   }
   // order belongs to ovner of wallet ?
   if (order.userId !== clntID.toString()) {
      return await ctx.answerCallbackQuery({
         text: "Sargydyň eyesi siz däl",
         show_alert: true,
      });
   }
   // user sum update
   const data =
      order.payment === "TMT"
         ? { sumTmt: order.user.sumTmt + order.product.priceTMT }
         : { sumUsdt: order.user.sumUsdt + order.product.priceUSDT };
   const userData = await prisma.user.update({
      where: {
         id: order.user.id,
      },
      data,
   });
   if (!userData) {
      console.log(err_6.d);
      return await ctx.answerCallbackQuery({
         text: err_6.m,
         show_alert: true,
      });
   }
   // preparing messages
   const ordIdMssg = ordrIdMssgFnc(order.id);
   const clntmssg = "✖️ Sargyt ýatyryldy.";
   try {
      await ctx.editMessageText(`${ordIdMssg} ${clntmssg}`, {
         parse_mode: "HTML",
      });
   } catch (error) {
      console.error("SMS UPDATE ERROR::", error);
      await ctx.answerCallbackQuery({
         text: "Sargyt kabul edilyarka yalnyslyk doredi.",
         show_alert: true,
      });
   }
});
// if order aççepted by an admin
bot.callbackQuery(/deliverOrder_(.+)/, async (ctx) => {
   const orderId = parseInt(ctx.match[1]);
   const adminId = ctx.from?.id;
   const ordrMsgIds = ordrMsgEdtStts.get(orderId);

   // admin checker
   const isAdmin = adminValid(adminId);
   if (isAdmin.error) {
      return await ctx.answerCallbackQuery({
         text: isAdmin.mssg,
         show_alert: true,
      });
   }

   // update and check order
   const order = await validator(
      orderId,
      ["accepted"],
      "delivering",
      adminId.toString()
   );
   if ("error" in order) {
      return await ctx.answerCallbackQuery({
         text: order.mssg,
         show_alert: true,
      });
   }
   if (!ordrMsgIds?.mssgIds) {
      console.log(err_7.d);
      return await ctx.answerCallbackQuery({
         text: err_7.m,
         show_alert: true,
      });
   }

   try {
      for (let i = 0; i < adminidS.length; i++) {
         await ctx.api.editMessageText(
            adminidS[i],
            ordrMsgIds?.mssgIds[i],
            `${ordrIdMssgFnc(order.id)} <blockquote expandable>${prdctDtlMssg(
               order.product.name,
               order.product.amount,
               order.receiver,
               order.payment === "TMT"
                  ? order.product.priceTMT
                  : order.product.priceUSDT,
               order.payment,
               order.userId
            )}</blockquote> \n ${ordrDlvrng(adminidS[i], ctx.from.first_name)}`,
            {
               reply_markup:
                  order.courierid === adminidS[i]
                     ? new InlineKeyboard()
                          .text("Tabşyrdym ☑️", "orderDelivered_" + order.id)
                          .row()
                          .text("Ýatyr ✖️", "declineOrder_" + order.id)
                          .row()
                          .copyText(order.receiver, order.receiver)
                     : undefined,
               parse_mode: "HTML",
            }
         );
      }
   } catch (error) {
      console.error("SMS ERROR::", error);
      await ctx.answerCallbackQuery({
         text: "Sargyt kabul edilyarka yalnyslyk doredi.",
         show_alert: true,
      });
   }
});
// order decline by an admin
bot.callbackQuery(/declineOrder_(.+)/, async (ctx) => {
   const orderId = parseInt(ctx.match[1]);
   const adminId = ctx.from?.id;
   const ordrMsgIds = ordrMsgEdtStts.get(orderId);
   // admin checker
   const isAdmin = adminValid(adminId);
   if (isAdmin.error) {
      return await ctx.answerCallbackQuery({
         text: isAdmin.mssg,
         show_alert: true,
      });
   }
   if (!ordrMsgIds?.mssgIds) {
      console.log(err_7.d);
      return await ctx.answerCallbackQuery({
         text: err_7.m,
         show_alert: true,
      });
   }
   // order validator
   const order = await validator(
      orderId,
      ["accepted", "delivering"],
      "cancelled",
      adminId.toString()
   );
   if ("error" in order) {
      return await ctx.answerCallbackQuery({
         text: order.mssg,
         show_alert: true,
      });
   }
   // user sum update
   const data =
      order.payment === "TMT"
         ? { sumTmt: order.user.sumTmt + order.product.priceTMT }
         : { sumUsdt: order.user.sumUsdt + order.product.priceUSDT };
   const userData = await prisma.user.update({
      where: {
         id: order.user.id,
      },
      data,
   });
   if (!userData) {
      console.log(err_6.d);
      return await ctx.answerCallbackQuery({
         text: err_6.m,
         show_alert: true,
      });
   }

   // preparing messages
   const askRsnMssg = "<b>❗Sargydyň ýatyrylmagynyň sebäbini ýazyň!</b>";
   const dslndMess = ordrDclngMssgFnc(adminId, ctx.from.first_name);
   const ordIdMssg = ordrIdMssgFnc(orderId);
   try {
      for (let i = 0; i < adminidS.length; i++) {
         await bot.api.editMessageText(
            adminidS[i],
            ordrMsgIds?.mssgIds[i],
            `${ordIdMssg} ${dslndMess} ${
               order.courierid === adminidS[i] ? "\n \n" + askRsnMssg : ""
            }`,
            {
               parse_mode: "HTML",
            }
         );
      }
      // yatyrma sebabi garasylyar
      reasonStates.set(adminId, {
         orderId: order.id,
         client: order.userId,
         mssgIds: ordrMsgIds.mssgIds,
      });
      ordrMsgEdtStts.delete(orderId);
   } catch (error) {
      console.error("BOT API ERR::", error);
      await ctx.answerCallbackQuery({
         text: "Bot api error.",
         show_alert: true,
      });
   }
});
// order complete command
bot.callbackQuery(/orderDelivered_(.+)/, async (ctx) => {
   const orderId = parseInt(ctx.match[1]);
   const adminId = ctx.from?.id;
   // validator
   const order = await validator(
      orderId,
      ["delivering"],
      "completed",
      adminId.toString()
   );
   if ("error" in order) {
      return await ctx.answerCallbackQuery({
         text: order.mssg,
         show_alert: true,
      });
   }

   // message ids
   const messageIds = ordrMsgEdtStts.get(orderId);
   if (!messageIds?.mssgIds) {
      console.log(err_7.d);
      return await ctx.answerCallbackQuery({
         text: err_7.m,
         show_alert: true,
      });
   }
   // preparing messages
   const ordIdmssg = ordrIdMssgFnc(orderId);
   const ordrCmltdMssg = ordrCmltdMssgFnc(ctx.from.id, ctx.from.first_name);
   try {
      for (let i = 0; i < adminidS.length; i++) {
         await bot.api.editMessageText(
            adminidS[i],
            messageIds?.mssgIds[i],
            `${ordIdmssg} <blockquote expandable>${prdctDtlMssg(
               order.product.name,
               order.product.amount,
               order.receiver,
               order.payment === "TMT"
                  ? order.product.priceTMT
                  : order.product.priceUSDT,
               order.payment,
               order.userId
            )}</blockquote> \n ${ordrCmltdMssg}`,
            {
               parse_mode: "HTML",
            }
         );
      }

      await bot.api.sendMessage(
         order.userId,
         `${ordIdmssg} ✅ Sargadyňyz Tabşyryldy`,
         {
            parse_mode: "HTML",
         }
      );
      ordrMsgEdtStts.delete(order.id);
   } catch (error) {
      console.error("bot api error: ", error);
      await ctx.answerCallbackQuery({
         text: "bot api error",
         show_alert: true,
      });
   }
});

// add sum comand
bot.command("add", async (ctx) => {
   const userID = ctx.from?.id;
   const isAdmin = adminValid(userID);
   if (sumAddStates.get(userID)) {
      return ctx.deleteMessage();
   }
   // if user not admin notify admins
   if (isAdmin.error) {
      adminidS.map(async (adminId) => {
         await ctx.api.sendMessage(
            adminId,
            sspcsCaseMs(isAdmin.mssg, "/add", ctx.from?.username, ctx.from?.id)
         );
      });
      return ctx.reply(isAdmin.mssg);
   }
   // asking walnum
   const { message_id } = await ctx.reply(`Hasap Nomer: ?`, {
      reply_markup: cnclAddSumBtnn(),
   });
   // open the state
   sumAddStates.set(userID, {
      mssgId: message_id,
      walNum: "",
      crrncy: "",
      sum: 0.0,
   });
   return;
});
// add sum crrcncy chooser
bot.callbackQuery(/^choose_(\w+)$/, (ctx) => {
   const adminId = ctx.from?.id;
   const sumAddState = sumAddStates.get(adminId);
   // if user not admin notify admins
   const isAdmin = adminValid(adminId);
   if (isAdmin.error) {
      adminidS.map(async (adminId) => {
         await ctx.api.sendMessage(
            adminId,
            sspcsCaseMs(isAdmin.mssg, "/add", ctx.from?.username, ctx.from?.id)
         );
      });
      return ctx.reply(isAdmin.mssg);
   }
   // set çurrençy
   if (sumAddState) {
      sumAddState.crrncy = ctx.match[1] as PaymentMethod;
   }
   // next message
   return ctx.editMessageText(
      /* adminId,
      sumAddState?.mssgId || 0, */
      `Hasap nomer: ${sumAddState?.walNum} \n Näçe ? ${sumAddState?.crrncy}`,
      {
         reply_markup: cnclAddSumBtnn(),
      }
   );
});
// complate add sum
bot.callbackQuery("complateAdd", async (ctx) => {
   const adminId = ctx.from?.id;
   const sumAddState = sumAddStates.get(adminId);
   const isAdmin = adminValid(adminId);
   // if user not admin notify admins
   if (isAdmin.error) {
      adminidS.map(async (adminId) => {
         await ctx.api.sendMessage(
            adminId,
            sspcsCaseMs(isAdmin.mssg, "/add", ctx.from?.username, ctx.from?.id)
         );
      });
      return ctx.reply(isAdmin.mssg);
   }
   // validating walnum exist
   const user = await prisma.user.findUnique({
      where: {
         walNum: sumAddState?.walNum,
      },
   });
   if (!user) {
      sumAddStates.delete(adminId);
      return ctx.editMessageText(
         "Yalnys beyle hasap nomer tapylmady, tazeden synansyn /add"
      );
   }
   // validating if sum is correct
   const fltdSum = sumAddState?.sum;
   if (fltdSum === undefined || isNaN(fltdSum) || fltdSum === 0) {
      sumAddStates.delete(adminId);
      return ctx.editMessageText(
         "Yalnys pul mukdary dogry yazylmady, tazeden synansyn /add"
      );
   }
   // is choosed currency correct
   const chsdCrrnc = sumAddState?.crrncy;
   if (typeof chsdCrrnc !== "string" || !(chsdCrrnc in PaymentMethod)) {
      sumAddStates.delete(adminId);
      return ctx.editMessageText("Yalnys Walyuta, tazeden synansyn /add");
   }
   // choosing currency
   const data =
      sumAddState?.crrncy === "TMT"
         ? { sumTmt: Number((user.sumTmt + fltdSum).toFixed(2)) }
         : { sumUsdt: Number((user.sumUsdt + fltdSum).toFixed(2)) };
   // updating user sum
   const addSum = await prisma.user.update({
      where: {
         id: user.id,
      },
      data,
   });
   // if updating went wrong
   if (!addSum) {
      sumAddStates.delete(adminId);
      return ctx.editMessageText("User Db update error, tazeden synansyn /add");
   }
  
   // save transaction to db
   const save = await prisma.summUpdate.create({
      data: {
         cashierid: adminId.toString(),
         clientid: user.id,
         currency: chsdCrrnc as PaymentMethod,
         sum: fltdSum,
      },
   });
   // if went wrong
   if (!save) {
      sumAddStates.delete(adminId);
      return ctx.api.editMessageText(
         adminId,
         sumAddState?.mssgId || 0,
         `Musderin hasaby kopeldildi yone proses hasaba alynmady. Bu bildirisi bellap goyun \n ${user.walNum}`
      );
   }
   sumAddStates.delete(adminId);
   try {
      adminidS.map((adminId) => {
         ctx.api.sendMessage(
            adminId,
            `Hasap +/- \n Kimden: <a href="tg://user?id=${adminId}">${ctx.from.first_name}</a> \n Kime: <a href="tg://user?id=${user.id}">${user.id}</a> \n Hasap: ${user.walNum} \n Mukdar: ${save.sum} ${save.currency}`,
            {
               parse_mode: "HTML",
            }
         );
      });
      ctx.api.sendMessage(
         user.id,
         `Hasabyňyz ${fltdSum} ${chsdCrrnc} ${
            fltdSum > 0 ? "köpeldi." : "azaldy."
         }`
      );
      return await ctx.deleteMessage();
   } catch (e) {
      console.error("bot api error: ", e);
      await ctx.editMessageText(
         "Proses tutush amala asyryldy yone adminlere habar berilmedi" + e
      );
   }
});
// cancel add sum comand
bot.callbackQuery("declineAdd", async (ctx) => {
   const adminId = ctx.from?.id;
   // if user not admin notify admins
   const isAdmin = adminValid(adminId);
   if (isAdmin.error) {
      adminidS.map(async (adminId) => {
         await ctx.api.sendMessage(
            adminId,
            sspcsCaseMs(isAdmin.mssg, "/add", ctx.from?.username, ctx.from?.id)
         );
      });
      return ctx.reply(isAdmin.mssg);
   }
   const sumAddState = sumAddStates.get(adminId);
   if (!sumAddState) {
      return ctx.editMessageText(
         "Hasap goşmak eýýäm ýatyryldy ýa-da amala aşyryldy ýa-da ýalňyşlyk döredi!"
      );
   }
   sumAddStates.delete(adminId);
   return await ctx.editMessageText("Hasap goşmak ýatyryldy");
});

bot.on("message", async (ctx) => {
   const userId = ctx.chat.id;
   const reasonState = reasonStates.get(userId);
   const sumAddState = sumAddStates.get(userId);
   // order declining reason
   if (reasonState) {
      const reason = ctx.message.text;
      const ordIdmess = ordrIdMssgFnc(reasonState.orderId);
      await bot.api.sendMessage(
         reasonState.client,
         ordIdmess + ordrDclngMssgFnc(userId.toString(), false, reason),
         {
            parse_mode: "HTML",
         }
      );
      for (let i = 0; i < adminidS.length; i++) {
         await bot.api.editMessageText(
            adminidS[i],
            reasonState.mssgIds[i],
            `${ordIdmess} ${ordrDclngMssgFnc(
               userId.toString(),
               ctx.from.first_name,
               reason
            )}`,
            {
               parse_mode: "HTML",
            }
         );
      }
      ctx.deleteMessage();
      reasonStates.delete(userId);
   } else if (sumAddState) {
      // addSumm data collector
      // collect walletNumber
      if (sumAddState.walNum === "") {
         if (!ctx.message.text) {
            sumAddStates.delete(userId);
            return ctx.reply("Hasap nomer girizilmedi. Başdan synanyşyň.");
         }
         sumAddState.walNum = ctx.message.text;
         ctx.api.editMessageText(
            userId,
            sumAddState.mssgId,
            `Hasap nomer: ${sumAddState.walNum} \n Walýuta ?`,
            {
               reply_markup: new InlineKeyboard()
                  .text("TMT", "choose_TMT")
                  .text("USDT", "choose_USDT")
                  .row()
                  .text("Ýatyr✖️", "declineAdd"),
            }
         );
         return await ctx.deleteMessage();
      } else if (sumAddState.sum === 0.0) {
         // collect sum
         const sum = ctx.message.text;
         if (!sum && isNaN(Number(sum))) {
            sumAddStates.delete(userId);
            return ctx.reply("Girizen mukdaryňyz nädogry. Başdan synanyşyň.");
         }
         sumAddState.sum = Number(Number(sum).toFixed(2));
         ctx.deleteMessage();
         ctx.api.editMessageText(
            userId,
            sumAddState.mssgId,
            `Hasap nomer: ${sumAddState.walNum} \n ${sumAddState.sum} ${sumAddState.crrncy}`,
            {
               reply_markup: new InlineKeyboard()
                  .text("Ýalňyş", "declineAdd")
                  .text("Dogry", "complateAdd"),
            }
         );
      }
   }
});

bot.start();
