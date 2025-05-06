import { nanoid } from "nanoid";
import { generateText } from "ai";
import { llm, paypalToolkit } from "../config/config";
import { PayeeInfo, SuborderResponse } from "../types";
import { notifyPayeeByEmail } from "./notifyPayeeByEmail";

export async function createAllSuborders(
  payees: PayeeInfo[],
  totalAmount: number,
  mainOrderId: string,
  description: string
): Promise<string> {
  const totalPayees = payees.length;

  const systemPrompt = `
For the order: \\order\\, there are multiple \\payees\\, each with a \\name\\ and \\email\\.
Split the \\totalAmount\\ equally among all payees.
For each payee:
  - Create a suborder for their share and map it to original order.

Return ONLY the raw JSON object in this format without ANY additional text:
{
  "mainOrder": {
    "description": "string",
    "totalAmount": number,
    "orderId": "string"
  },
  "payee": {
    "name": "string",
    "email": "string",
    "orderId": "string",
    "suborderAmount": "number",
    "paymentLink": "string",
    "emailMessage": "string",
    "paymentStatus": "string"
  }
}

Critical: Do not ask for other payee's details, we will process one payee at a time.
CRITICAL: Return ONLY the JSON with NO explanation, NO formatting, NO markdown, and NO additional text whatsoever.
`;

  for (let i = 0; i < totalPayees; i++) {
    const payee = payees[i];

    try {
      const userPrompt = `
Now, for main OrderID: ${mainOrderId}, this is payee number ${i + 1} out of ${totalPayees}.
description: "${description}"
totalAmount: ${totalAmount}
payees: [{ name: "${payee.name}", email: "${payee.email}" }]
`;

      if (!process.env.ANTHROPIC_API_KEY) {
        throw new Error("Claude API Key missing.");
      }

      console.log(`✨ Generating suborder for ${payee.name} (${i + 1}/${totalPayees})`);

      const responseText = await generateText({
        model: llm,
        tools: paypalToolkit.getTools(),
        maxSteps: 25,
        prompt: systemPrompt + "\n\n" + userPrompt,
      });

      const parsed = JSON.parse(responseText) as SuborderResponse;
      const generated = parsed.payees[0];

      await notifyPayeeByEmail({
        name: generated.name,
        email: generated.email,
        amount: generated.suborderAmount,
        orderId: mainOrderId,
        subOrderId: generated.orderId,
        paymentLink: generated.paymentLink,
        description,
      });

    } catch (error) {
      console.error(`❌ Claude failed for ${payee.name}:`, error);

      const fallbackOrderId = `SUB-${mainOrderId}-${nanoid(8).toUpperCase()}`;
      const fallbackAmount = payee.amount || totalAmount / totalPayees;
      const fallbackPaymentLink = `https://example.com/pay/${fallbackOrderId}`;

      await notifyPayeeByEmail({
        name: payee.name,
        email: payee.email,
        amount: fallbackAmount,
        orderId: mainOrderId,
        subOrderId: fallbackOrderId,
        paymentLink: fallbackPaymentLink,
        description,
      });
    }
  }

  return "All suborders created and notified.";
}
