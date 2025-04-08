import { PrismaClient } from "@prisma/client";


const prisma = new PrismaClient();
async function main() {
   // Seed prem
   await prisma.product.createMany({
      data: [
         {
            name: "tgprem",
            amount: 1,
            priceTMT: 15,
            priceUSDT: 0.75,
         },
         {
            name: "tgprem",
            amount: 3,
            priceTMT: 250,
            priceUSDT: 12.5,
         },
         {
            name: "tgprem",
            amount: 6,
            priceTMT: 330,
            priceUSDT: 16.5,
         },
         {
            name: "tgprem",
            amount: 12,
            priceTMT: 590,
            priceUSDT: 29.5,
         },
         /* tg star */
         {
            name: "star",
            amount: 50,
            priceTMT: 15,
            priceUSDT: 0.75,
         },
         {
            name: "star",
            amount: 75,
            priceTMT: 20,
            priceUSDT: 1.13,
         },
         {
            name: "star",
            amount: 100,
            priceTMT: 30,
            priceUSDT: 1.5,
         },
         {
            name: "star",
            amount: 150,
            priceTMT: 45,
            priceUSDT: 2.25,
         },
         {
            name: "star",
            amount: 250,
            priceTMT: 75,
            priceUSDT: 3.75,
         },
         {
            name: "star",
            amount: 350,
            priceTMT: 125,
            priceUSDT: 5.25,
         },
         {
            name: "star",
            amount: 500,
            priceTMT: 150,
            priceUSDT: 7.5,
         },
         {
            name: "star",
            amount: 750,
            priceTMT: 225,
            priceUSDT: 11.25,
         },
         {
            name: "star",
            amount: 1000,
            priceTMT: 300,
            priceUSDT: 15,
         },
         {
            name: "star",
            amount: 1500,
            priceTMT: 410,
            priceUSDT: 22.5,
         },
         {
            name: "star",
            amount: 2500,
            priceTMT: 650,
            priceUSDT: 37.5,
         },
         {
            name: "star",
            amount: 5000,
            priceTMT: 1300,
            priceUSDT: 75,
         },
         {
            name: "star",
            amount: 10000,
            priceTMT: 3000,
            priceUSDT: 150,
         },
         {
            name: "jtn",
            amount: 100,
            priceTMT: 30,
            priceUSDT: 1.5,
         },
         {
            name: "jtn",
            amount: 100,
            priceTMT: 30,
            priceUSDT: 1.5,
         },
         {
            name: "jtn",
            amount: 100,
            priceTMT: 30,
            priceUSDT: 1.5,
         },
         {
            name: "jtn",
            amount: 100,
            priceTMT: 30,
            priceUSDT: 1.5,
         },
         {
            name: "jtn",
            amount: 100,
            priceTMT: 30,
            priceUSDT: 1.5,
         },
         {
            name: "jtn",
            amount: 100,
            priceTMT: 30,
            priceUSDT: 1.5,
         },
         {
            name: "jtn",
            amount: 100,
            priceTMT: 30,
            priceUSDT: 1.5,
         },
         {
            name: "jtn",
            amount: 100,
            priceTMT: 30,
            priceUSDT: 1.5,
         },
         {
            name: "jtn",
            amount: 100,
            priceTMT: 30,
            priceUSDT: 1.5,
         },
         {
            name: "jtn",
            amount: 100,
            priceTMT: 30,
            priceUSDT: 1.5,
         },
         {
            name: "jtn",
            amount: 100,
            priceTMT: 30,
            priceUSDT: 1.5,
         },
         {
            name: "jtn",
            amount: 100,
            priceTMT: 30,
            priceUSDT: 1.5,
         },

         {
            name: "uc",
            amount: 100,
            priceTMT: 30,
            priceUSDT: 1.5,
         },
         {
            name: "uc",
            amount: 100,
            priceTMT: 30,
            priceUSDT: 1.5,
         },
         {
            name: "uc",
            amount: 100,
            priceTMT: 30,
            priceUSDT: 1.5,
         },
         {
            name: "uc",
            amount: 100,
            priceTMT: 30,
            priceUSDT: 1.5,
         },
         {
            name: "uc",
            amount: 100,
            priceTMT: 30,
            priceUSDT: 1.5,
         },
         {
            name: "uc",
            amount: 100,
            priceTMT: 30,
            priceUSDT: 1.5,
         },
         {
            name: "uc",
            amount: 100,
            priceTMT: 30,
            priceUSDT: 1.5,
         },
         {
            name: "uc",
            amount: 100,
            priceTMT: 30,
            priceUSDT: 1.5,
         },
         {
            name: "uc",
            amount: 100,
            priceTMT: 30,
            priceUSDT: 1.5,
         },
      ],
   });


   console.log("Seeding completed successfully!");
}

main()
   .catch((e) => {
      console.error(e);
      process.exit(1);
   })
   .finally(async () => {
      await prisma.$disconnect();
   });
