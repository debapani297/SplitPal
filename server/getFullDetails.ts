import { generateText } from "ai";
import { llm, llm1, paypalToolkit } from "./env";
import { UserOrdersResponse } from "./types";
    
export async function getFullDetails(
  userEmail: string,
  responseText3: any
): Promise<UserOrdersResponse> {
  try {
    const systemPrompt4 = `
These are Full details of orders  ${JSON.stringify(responseText3)}. 
`;
 const userPrompt = `
 filter the main-orders with all payees where ${userEmail} is involved.
 Return the result in this format:
{
  "orders": [
    {
      "mainOrder": {
        "description": "description-of-main-Order",
        "totalAmount": totalAmount-of-main-Order,
        "orderId": "orderId-of-main-Order",
        "paymentLink": "paymentLink-of-main-order",
        "paymentStatus": "paymentStatus-of-main-order"
      },
      "subOrder": [
      {
        "name": "name-of-payee",
        "email": "email-of-payee",
        "orderId": "orderId-of-sub-Order",
        "suborderAmount": Amount-of-sub-Order,
        "paymentLink": "paymentLink-of-the-suborder",
        "paymentStatus": "string"
      },
]
    }
  ]
}
CRITICAL: Return ONLY the JSON with NO explanation, NO formatting, NO markdown, and NO additional text whatsoever.
 `;

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error("Claude API key missing. Cannot fetch user orders.");
}

console.log(`📥 Fetching orders for user: ${userEmail}`);

const {text: responseText4}  = await generateText({
  model: llm,
  tools: paypalToolkit.getTools(),
  maxSteps: 25,
  prompt: JSON.stringify(responseText3) + "\n\n" + userPrompt,
});

console.log("Claude response:", responseText4);
console.log("\n\n\n");

    const userOrders = JSON.parse(responseText4) as UserOrdersResponse;
    
    return userOrders;
    
  } catch (error) {
    console.error(`❌ Failed to get orders:`, error);
    return {
      user: '',
      orders: [],
    };
  }
}
function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}