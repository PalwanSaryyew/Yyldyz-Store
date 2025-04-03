import ItemBox from "@/components/item/ItemBox";
import { cmcApi } from "@/lib/fetchs";
import { toncoinId } from "@/lib/settings";
import { prisma } from "../../../prisma/prismaSett";

const Page = async () => {
   const data = await prisma.product.findMany({
      where: {
         name: "tgprem",
      },
   });
   const tonPrice = await cmcApi(toncoinId);
   return (
      <div className="flex flex-col gap-4 py-8 w-full items-center">
         {data.map((item) => (
            <ItemBox item={item} key={item.id} tonPrice={tonPrice} />
         ))}
      </div>
   );
};
export default Page;
