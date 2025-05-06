// server/workflows/createMainOrder.ts

import { nanoid } from "nanoid";
import { generateText } from "ai";
import { llm, paypalToolkit } from "../config/config";
import { PayeeInfo, MainOrderResponse } from "../types";
import { createAllSuborders } from "./createPayeeSuborder";

/**
 * Creates a main order using Claude AI, then calls suborder creation.
 * Returns a simple string message (or fallback).
 */
export async function createMainOrder(
  description: string,
  totalAmount: number,
  payees: PayeeInfo[]
): Promise<string> {
  try {
    const systemPrompt = `
You are helping manage a group payment system.

You will receive metadata from an API which includes:
- A \\description\\ of the payment purpose
- The \\totalAmount\\ to be split

Create an order using the provided \\description\\ and \\totalAmount\\.

Return ONLY a JSON object in this format:
{
  "orderId": "string",
  "description": "string",
  "totalAmount": number,
  "paymentLink": "string",
  "paymentStatus": "string"
}
Do not add any explanation, markdown formatting, or prefix like \`json\`.
`;

    const userPrompt = `
Create order for description: "${description}",
totalAmount: ${totalAmount},
`;

    if (!process.env.ANTHROPIC_API_KEY) {
      console.warn("Claude API key missing. Using fallback order ID.");
      const fallbackId = `ORDER-FALLBACK-${nanoid(12).toUpperCase()}`;
      return fallbackId;
    }

    console.log("Generating main order with Claude...");
    const response = await generateText({
      model: llm,
      tools: paypalToolkit.getTools(),
      maxSteps: 25,
      prompt: systemPrompt + "\n\n" + userPrompt,
    });

    // ✅ Your parsing style
    console.log("Claude response:", response);
    const orderDetails = JSON.parse(response) as MainOrderResponse;

    // ✅ Call suborder generation function
    await createAllSuborders(payees, totalAmount, orderDetails.orderId, description);

    // ✅ Return final status string
    return `Main order ${orderDetails.orderId} and suborders created`;
  } catch (error) {
    console.error("Error creating main order:", error);
    const fallbackId = `ORDER-ERROR-${nanoid(12).toUpperCase()}`;
    return fallbackId;
  }
}
