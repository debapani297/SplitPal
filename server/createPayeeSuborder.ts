import { nanoid } from "nanoid";
import { generateText } from "ai";
import { llm, llm1, paypalToolkit } from "./env";
import { PayeeInfo, SuborderResponse, SuborderSummary } from "./types";
import { notifyPayeeByEmail } from "./notifyPayeeByEmail";
import { anthropic } from "@ai-sdk/anthropic";

export async function createAllSuborders(
  payees: PayeeInfo[],
  totalAmount: number,
  mainOrderId: string,
  description: string
): Promise<SuborderSummary> {
  const totalPayees = payees.length;

  let systemPrompt = `
For the order: \order\, There are multiple \payees\, each with a \name\ and \email\.
Split the \totalAmount\ equally among all payees.
For each payee:
    - Create a suborder for their share and map it to original order.
`;

const suborders = [];
  let x=0; let lm;
  for (let i = 0; i < totalPayees; i++) {
    const payee = payees[i];
    if(x){
      lm= llm1;
      x=1;
      // export const llm1 = anthropic("claude-3-7-sonnet-20250219");
      // export const llm = anthropic("claude-3-5-sonnet-20241022");
    }else{
      lm=llm;
      x=0;
    }
    await sleep(38000);
    try {

const userPrompt = `
Refer main OrderID: ${mainOrderId} for total amount and description, There are total ${totalPayees} Payees. create order for this payee-${i + 1} first by splitting the amount for $${totalPayees} , process 1 payee right now. 
payee ${i + 1}: [ { name: "${payee.name}", email: "${payee.email}" }, ]
 Strictly CRITICAL:  Only return the JSON. Do not add explanation or markdown formatting.
 Strictly CRITICAL: Return ONLY the JSON with NO explanation, NO formatting, NO markdown, and NO additional text.
 {
  "mainOrder": {
    "description": "string",
    "totalAmount": "number",
    "orderId": "string"
  },
  "payees": [
    {
      "name": "string",
      "email": "string",
      "orderId": "string",
      "suborderAmount": "number",
      "paymentLink": "string",
      "emailMessage": "string",
      "paymentStatus": "string"
    }
  ]
}
  `;

      if (!process.env.ANTHROPIC_API_KEY) {
        throw new Error("Claude API Key missing.");
      }

      console.log(`✨ Generating suborder for ${payee.name} (${i + 1}/${totalPayees})`);

      const {text: responseText} = await generateText({
        model: lm,
        tools: paypalToolkit.getTools(),
        maxSteps: 30,
        prompt: systemPrompt + "\n\n" + userPrompt,
      });
      console.log(responseText);
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

      suborders.push({
        orderId: generated.orderId,
        name: generated.name,
        email: generated.email,
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

  // return "All suborders created and notified.";
  return {
    mainID: mainOrderId,
    suborders: suborders,
  };

}
function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}