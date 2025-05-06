import { generateText } from "ai";
import { llm, paypalToolkit } from "../config/config";
import { UserOrdersResponse } from "../types";

/**
 * Retrieves all main and suborders associated with a user's email.
 */
export async function getUserOrders(
  userEmail: string
): Promise<UserOrdersResponse> {
  try {
    const systemPrompt = `
Show orders mapped to user: ${userEmail}
Return the result in this format:
{
  "user": "string",
  "orders": [
    {
      "mainOrder": {
        "description": "string",
        "totalAmount": number,
        "orderId": "string"
      },
      "subOrder": {
        "name": "string",
        "email": "string",
        "orderId": "string",
        "suborderAmount": number,
        "paymentStatus": "string"
      }
    }
  ]
}
CRITICAL: Return ONLY the JSON with NO explanation, NO formatting, NO markdown, and NO additional text whatsoever.
`;

    const userPrompt = `
Find all orders where this user is a payee:
User Email: ${userEmail}
`;

    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error("Claude API key missing. Cannot fetch user orders.");
    }

    console.log(`📥 Fetching orders for user: ${userEmail}`);

    const responseText = await generateText({
      model: llm,
      tools: paypalToolkit.getTools(),
      maxSteps: 25,
      prompt: systemPrompt + "\n\n" + userPrompt,
    });

    console.log("Claude response:", responseText);

    const userOrders = JSON.parse(responseText) as UserOrdersResponse;
    return userOrders;
  } catch (error) {
    console.error(`❌ Failed to get orders for ${userEmail}:`, error);
    return {
      user: userEmail,
      orders: [],
    };
  }
}
