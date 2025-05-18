import { nanoid } from "nanoid";
import { generateText } from "ai";
import { llm, paypalToolkit } from "./env";
import { notifyPayeeByEmail } from "./notifyPayeeByEmail";
import { SuborderResponse, Suborder, PayeeInfo } from "./types";

export async function handleRejectedPayment(
  rejectedSuborderId: string
): Promise<string> {
  // Step 1: Get details of rejected suborder
  const suborderPrompt = `
Show details to suborderid: ${rejectedSuborderId}
Return the result in this format:
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
    "suborderAmount": number
  }
}
CRITICAL: Return ONLY the JSON with NO explanation, NO formatting, NO markdown, and NO additional text whatsoever.
`;

  const {text: suborderRes}   = await generateText({
    model: llm,
    tools: paypalToolkit.getTools(),
    maxSteps: 25,
    prompt: suborderPrompt,
  });

  const order = JSON.parse(suborderRes) as Suborder;

  // Step 2: Get non-rejected payees of the same order
  const payeeListPrompt = `
list unique payees of orderid: ${order.mainOrder.orderId}, whose payments are not rejected.
Return the result in this format:
{
  "payees": [
    {
      "name": "string",
      "email": "string"
    }
  ]
}
CRITICAL: Return ONLY the JSON with NO explanation, NO formatting, NO markdown, and NO additional text whatsoever.
`;

  const {text: payeeListRes}  = await generateText({
    model: llm,
    tools: paypalToolkit.getTools(),
    maxSteps: 25,
    prompt: payeeListPrompt,
  });

  const { payees }: { payees: PayeeInfo[] } = JSON.parse(payeeListRes);

  const rejectedAmount = order.subOrder.suborderAmount;
  const totalPayees = payees.length;

  // Step 3: Claude prompt for redistribution
  const redistributionPrompt = `
For main order, payee rejected payment for suborder.
split the outstanding amount equally among other members.
For each payee:
  - Create a suborder for their share and map it to original order.
Provide new order details with additional amount.

Return the result as a JSON object in this format:
{
  "mainOrder": {
    "description": "string",
    "totalAmount": number,
    "orderId": "string"
  },
  "payees": [
    {
      "name": "string",
      "email": "string",
      "orderId": "string",
      "suborderAmount": number,
      "paymentLink": "string",
      "emailMessage": "string",
      "paymentStatus": "string"
    }
  ]
}
Critical: Donot ask for other payee's details, we will process one at a time.
CRITICAL: Return ONLY the JSON with NO explanation, NO formatting, NO markdown, and NO additional text whatsoever.
`;

  // Step 4: Generate suborders one by one
  for (let i = 0; i < payees.length; i++) {
    const payee = payees[i];

    try {
      const userPrompt = `
Now, For main OrderID: ${order.mainOrder.orderId}, this is payee number ${i + 1} out of ${payees.length}.
description: "${order.mainOrder.description}"
totalAmount: ${rejectedAmount}
payees: [{ name: "${payee.name}", email: "${payee.email}" }]
`;

      const {text: responseText}  = await generateText({
        model: llm,
        tools: paypalToolkit.getTools(),
        maxSteps: 25,
        prompt: redistributionPrompt + "\n\n" + userPrompt,
      });

      const generated = JSON.parse(responseText) as SuborderResponse;
      const updated = generated.payees[0];

      await notifyPayeeByEmail({
        name: updated.name,
        email: updated.email,
        amount: updated.suborderAmount,
        orderId: order.mainOrder.orderId,
        subOrderId: updated.orderId,
        paymentLink: updated.paymentLink,
        description: order.mainOrder.description,
      });

    } catch (error) {
      console.error(`❌ Error redistributing to ${payee.name}:`, error);

      // Fallback suborder
      const fallbackOrderId = `SUB-${order.mainOrder.orderId}-${nanoid(8).toUpperCase()}`;
      const fallbackAmount = rejectedAmount / payees.length;
      const fallbackLink = `https://example.com/pay/${fallbackOrderId}`;

      await notifyPayeeByEmail({
        name: payee.name,
        email: payee.email,
        amount: fallbackAmount,
        orderId: order.mainOrder.orderId,
        subOrderId: fallbackOrderId,
        paymentLink: fallbackLink,
        description: order.mainOrder.description,
      });
    }
  }

  return "Payment redistribution completed and emails sent.";
}
