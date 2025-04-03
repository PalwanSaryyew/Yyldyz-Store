import { trnsctnScript } from "../../../../bot/bot";
import { prisma } from "../../../../prisma/prismaSett";

export async function GET(request: Request) {
   const { searchParams } = new URL(request.url);
   const trnsctnRslt = searchParams.get("trnsctn");
   const bid = searchParams.get("bid");
   const trnsctnStts = searchParams.get("s");
   const orderId = searchParams.get("oi");
   console.log("trnsctnStts:: " + trnsctnStts, "trnsctnRslt:: ", trnsctnRslt);

   await prisma.order.update({
      where: {
         id: Number(orderId),
      },
      data: {
         status: "paid",
      },
   });

   if (trnsctnStts?.toString() === "1") {
      await trnsctnScript(
         Number(bid),
         "Toleginiz alyndy, sargydynyz mumkin bolan in gysga wagtda gowsurylar"
      );
   }
   return Response.json({});
}
