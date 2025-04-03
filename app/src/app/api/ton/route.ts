import { ourTonAddress } from "@/lib/settings";
import { prisma } from "../../../../prisma/prismaSett";
import { noticeAdmins, noticeClient } from "../../../../bot/bot";
const apiKey = process.env.TON_API;
const limit = 10;

// Eğer @toncenter/api kullanıyorsanız import edebilirsiniz:
// import { Transaction } from '@toncenter/api';

export async function GET(request: Request) {
   const { searchParams } = new URL(request.url);
   const oid = searchParams.get("oid");
   if (!oid) {
      console.error("Transaction ID (oid) is null or undefined.");
      return new Response("Invalid transaction ID", { status: 400 });
   }

   async function kontrolEtVeBilgileriAl(
      cuzdanAdresi: string,
      beklenenSiparisId: string,
      retryCount: number = 0,
      maxRetries: number = 3
   ): Promise<{ hash: string; comment: string } | null> {
      // Dönüş tipini güncelledim
      try {
         const response = await fetch(
            `https://toncenter.com/api/v2/getTransactions/${cuzdanAdresi}?api_key=${apiKey}&limit=${limit}`
         );
         const data = await response.json();

         if (data.ok && data.result) {
            for (const islem of data.result) {
               const yorum = islem.comment;
               if (yorum) {
                  const yorumSatirlari = yorum.split("\n");
                  if (yorumSatirlari.length >= 2) {
                     const siparisIdSatiri = yorumSatirlari[1]?.trim();
                     if (siparisIdSatiri === beklenenSiparisId) {
                        return islem;
                     }
                  }
               }
            }
            console.log(
               `Beklenen Sipariş ID (${beklenenSiparisId}) ile eşleşen işlem bulunamadı. Deneme: ${
                  retryCount + 1
               }/${maxRetries}`
            );
            if (retryCount < maxRetries) {
               await new Promise((resolve) => setTimeout(resolve, 30000)); // Tekrar deneme süresini kısalttım (30 saniye)
               return kontrolEtVeBilgileriAl(
                  cuzdanAdresi,
                  beklenenSiparisId,
                  retryCount + 1,
                  maxRetries
               );
            }
            return null;
         } else {
            console.log("İşlem listesi alınamadı veya bir hata oluştu."); // Hata mesajını düzelttim
            return null;
         }
      } catch (error) {
         console.error("API error:", error);
         return null;
      }
   }

   const order = await prisma.order.findUnique({
      where: {
         id: Number(oid),
      },
      include: {
         tonTransaction: true,
      },
   });
   if (!order) {
      console.error("Order Not Found.");
      return new Response("Order Not Found.", { status: 404 });
   }

   // Implement a delay before checking
   await new Promise((resolve) => setTimeout(resolve, 15000)); // Wait for 15 seconds
   const transaction = await kontrolEtVeBilgileriAl(
      ourTonAddress,
      order.tonTransaction?.id ?? ""
   );

   if (transaction) {
      const updatetOrder = await prisma.order.update({
         where: { id: Number(oid) },
         data: { status: "paid" },
         include: {
            tonTransaction: true,
         },
      });
      noticeAdmins(
         updatetOrder
      );
      return Response.json({ success: true, status: 200 });
   } else {
      noticeClient(`Ödeme Bulunamadı! Sipariş ID: ${order.id}`); // Hata mesajını düzelttim
      return Response.json({
         success: false,
         status: 404,
      });
   }
}
