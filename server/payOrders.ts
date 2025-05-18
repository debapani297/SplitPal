import { generateText } from "ai";
import { llm, paypalToolkit } from "./env";
import { UserOrdersResponse } from "./types";

/**
 * Retrieves all main and suborders associated with a user's email.
 */
export async function paySubOrders(
  userEmail: string,
  userOrderMap: {
    [email: string]: {
      mainOrder: string[];
      subOrder: string[];
    };
  }
): Promise<any> {
  try {
    const systemPrompt = `

These are full orders: ${userOrderMap}.
Filter the suborders where ${userEmail} is involved with "PAYER_ACTION_REQUIRED" status.

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

    const {text: responseText}  = await generateText({
      model: llm,
      tools: paypalToolkit.getTools(),
      maxSteps: 25,
      prompt: systemPrompt,
    });

    console.log("Claude response:", responseText);

    const userOrders = JSON.parse(responseText);
    return userOrders;
  } catch (error) {
    console.error(`❌ Failed to get orders for ${userEmail}:`, error);
    return {
      user: userEmail,
      orders: [],
    };
  }
}
