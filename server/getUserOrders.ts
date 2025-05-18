import { generateText } from "ai";
import { llm, llm1, paypalToolkit } from "./env";
import { UserOrdersResponse } from "./types";

/**
 * Retrieves all main and suborders associated with a user's email.
 */
export async function getUserOrders(
  userEmail: string,
  userOrderMap: {
    [email: string]: {
      mainOrder: string[];
      subOrder: string[];
    };
  }
): Promise<any> {
  try {

    console.log(userOrderMap + '\n\n')

    const mainOrderIDs = Array.from(
      new Set(
        Object.values(userOrderMap)
          .flatMap(user => user.mainOrder)
      )
    );
    console.log(mainOrderIDs + '\n\n');

    const subOrderIDs = Array.from(
      new Set(
        Object.values(userOrderMap)
          .flatMap(user => user.subOrder)
      )
    );
    console.log(subOrderIDs + '\n\n');

    const users = {
      users: Object.entries(userOrderMap).map(([email, data]) => ({
        email,
        name: email.split("@")[0], // or fallback name
        suborders: data.subOrder,
      }))
    };
    console.log(users + '\n\n');
    
    let x=0; let lm;    //to switch llms for faster delivery

const systemPrompt = `
Show me details of the order=${mainOrderIDs}", along with its suborders.

Return the result in this format:
{
  "orders": [
      {
        "description": "description-of-main-Order",
        "totalAmount": totalAmount-of-main-Order,
        "orderId": "orderId-of-main-Order",
        "paymentLink": "paymentLink-of-the-order",
        "paymentStatus": "paymentStatus-of-the-order"
      },
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
      prompt: systemPrompt
    });

    console.log("Claude response:", responseText);

        if(x){
          lm= llm1;
          x=1;
        }else{
          lm=llm;
          x=0;
        }

    const systemPrompt2 = `
get details of these suborders: ${subOrderIDs}.
These are the main Orders: ${JSON.stringify(responseText)}.
Map them properly and 
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
        "paymentStatus": "paymentStatus-of-the-suborder"
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

    const {text: responseText2}  = await generateText({
      model: llm,
      tools: paypalToolkit.getTools(),
      maxSteps: 25,
      prompt: systemPrompt2
    });

    console.log("Claude response:", responseText2);
    console.log("\n\n\n");
    if(x){
          lm= llm1;
          x=1;
        }else{
          lm=llm;
          x=0;
        }


await sleep(20000);
    const systemPrompt3 = `
these details are of the suborders with their main Orders: ${JSON.stringify(responseText2)}.
There are some mismatch for suborders mapped to the name and email, that information is present below:
${JSON.stringify(users)}.

Map these details properly and

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
        "name": "ith name-of-payee",
        "email": "ith email-of-payee",
        "orderId": "ith orderId-of-sub-Order",
        "suborderAmount": ith Amount-of-sub-Order,
        "paymentLink": "ith paymentLink-of-the-suborder",
        "paymentStatus": "ith paymentStatus-of-the-suborder"
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

const {text: responseText3}  = await generateText({
  model: llm,
  tools: paypalToolkit.getTools(),
  maxSteps: 25,
  prompt: systemPrompt3
});

console.log("Claude response:", responseText3);
console.log("\n\n\n");
if(x){
          lm= llm1;
          x=1;
        }else{
          lm=llm;
          x=0;
        }

// ========================================================================
await sleep(20000);

  return responseText3;

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