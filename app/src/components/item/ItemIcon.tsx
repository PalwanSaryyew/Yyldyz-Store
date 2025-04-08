"use client";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { ProductType } from "../../../prisma/prismaSett";
const ItemIcon = () => {
   const currentPath = usePathname();

   return (
      <Image
         src={`/jtns/${
            currentPath === ("/" as ProductType) ? "star" : currentPath.slice(1)
         }.png`}
         width={28}
         height={28}
         alt=""
         rel="preload"
         priority
      />
   );
};

export default ItemIcon;
