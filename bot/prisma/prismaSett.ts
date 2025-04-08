import {
   PrismaClient,
   Admin,
   Order,
   Product,
   SummUpdate,
   TonTransaction,
   User,
   OrderStatus,
   PaymentMethod,
   ProductType,
   UserRole,
   PrismaPromise,
   $Enums,
   Prisma,
} from "@prisma/client";

const prismaClientSingleton = () => {
   return new PrismaClient();
};

declare const globalThis: {
   prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export {
   prisma,
   Admin,
   Order,
   Product,
   SummUpdate,
   TonTransaction,
   User,
   OrderStatus,
   PaymentMethod,
   ProductType,
   UserRole,
   PrismaPromise,
   $Enums,
   Prisma,
};

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;
