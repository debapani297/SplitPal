/**
 * Sends a single email notification to a payee.
 * Currently stubbed with console.log. Replace with real email service later.
 */
export async function notifyPayeeByEmail({
  name,
  email,
  amount,
  orderId,
  subOrderId,
  paymentLink,
  description,
}: {
  name: string;
  email: string;
  amount: number;
  orderId: string;
  subOrderId: string;
  paymentLink: string;
  description: string;
}): Promise<void> {
  // Simulate async call
  await new Promise((res) => setTimeout(res, 100));

  console.log(`📨 Sending email to ${name} <${email}>`);
  console.log(`💳 Order: ${orderId}, Suborder: ${subOrderId}`);
  console.log(`🧾 Amount: $${amount}`);
  console.log(`🔗 Payment link: ${paymentLink}`);
  console.log(`📝 Message: Hi ${name}, please pay $${amount} for "${description}".\n`);
}
