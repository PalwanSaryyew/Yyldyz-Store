export async function GET(request: Request) {
   const { searchParams } = new URL(request.url);
   const adr = searchParams.get("adr");
   const apiKey = process.env.TON_API;
   const apiUrl = `https://toncenter.com/api/v2/getAddressBalance?address=${adr}&api_key=${apiKey}`;
   try {
      const response = await fetch(apiUrl);
      const data = await response.json();
      if (data.ok) {
         return Response.json({
            success: true,
            ball: data.result / 1000000000, // Nano TON to TON
         });
      } else {
         console.error(`API ERROR: ${data.error}`);
         return Response.json({ success: false });
      }
   } catch (error) {
      console.error("WENT WRONG", error);
      return Response.json({ success: false });
   }
}
