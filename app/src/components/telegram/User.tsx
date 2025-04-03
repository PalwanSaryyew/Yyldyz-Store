"use client";
import { webApp } from "@/lib/webApp";
import { useUser } from "@/utils/UniStore";
import Image from "next/image";
import { useEffect } from "react";

const User = () => {
   const setUserState = useUser((state) => state.add);
   const getUserState = useUser((state) => state.user);

   useEffect(() => {
      const getAll = async () => {
         const { initDataUnsafe } = await webApp();
         const { user } = initDataUnsafe;

         if (user && user.id && user.username && user.photo_url) {
            setUserState({
               id: user.id,
               photo_url: user.photo_url,
               username: user.username,
               name: user.first_name,
            });
         }
      };

      getAll();
   }, [setUserState]);

   return (
      <div className="flex items-center pr-2">
         <Image
            alt=""
            src={getUserState?.photo_url || "/oth/no-user.png"}
            width={37}
            height={37}
            className="rounded-full border"
            rel="preload"
            priority
         />
         
      </div>
   );
};

export default User;
