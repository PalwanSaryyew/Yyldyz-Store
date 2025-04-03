import { cmcApi } from "@/lib/fetchs";
import { toncoinId } from "@/lib/settings";

export interface coinPriceType{
   success: boolean
   data: number
}

export async function GET(request: Request) {
   console.log('price');
   const { searchParams } = new URL(request.url);
   const coinName = searchParams.get("coin");
   const coinId = coinName === "TON" ? toncoinId : 0;
   const price = await cmcApi(coinId);
   if (price) {
      return Response.json({
         success: true,
         data: price,
      });
   }
   return Response.json({
      success: false,
   });
}
