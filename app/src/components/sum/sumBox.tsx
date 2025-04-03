"use client";

import { useEffect, useState } from "react";
import { useSumm, useUser } from "@/utils/UniStore";
import Sum from "./sum";

const SumBox = () => {
   const user = useUser((state) => state.user);
   const setSumm = useSumm((state) => state.add);
   interface SumType {
      tmt: number;
      usdt: number;
   }

   const [sum, setSum] = useState<SumType | null>(null);

   useEffect(() => {
      const getSum = async () => {
         const response = await fetch("/api/sum?uid=" + user?.id);
         const data = await response.json();
         setSum(data.sum);
         setSumm({
            nmbr: data.sum.nmbr,
            usdt: data.sum.usdt,
            tmt: data.sum.tmt,
         });
      };

      getSum();
   }, [user?.id, setSumm]);
   return (
      <div className="flex -translate-x-12">
         <Sum sum={sum?.tmt ?? 0} crrncy="TMT"/>
         <Sum sum={sum?.usdt ?? 0} crrncy="USDT"/>
      </div>
   );
};

export default SumBox;
