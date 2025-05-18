import dotenv from "dotenv";
import { anthropic } from "@ai-sdk/anthropic";
import { PayPalWorkflows, PayPalAgentToolkit, ALL_TOOLS_ENABLED } from "@paypal/agent-toolkit/ai-sdk";
import { generateText } from "ai";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

// Polyfill __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, "../.env") });

// Debug
if (!process.env.ANTHROPIC_API_KEY) {
  console.warn("❌ ANTHROPIC_API_KEY not loaded.");
} else {
  console.log("✅ Claude key loaded:", process.env.ANTHROPIC_API_KEY.slice(0, 10), "...");
}

// Claude Model
export const llm1 = anthropic("claude-3-7-sonnet-20250219");
export const llm = anthropic("claude-3-5-sonnet-20241022");

// PayPal Config
const ppConfig = {
  clientId: process.env.PAYPAL_CLIENT_ID || "",
  clientSecret: process.env.PAYPAL_CLIENT_SECRET || "",
  configuration: {
    actions: ALL_TOOLS_ENABLED,
  },
};

export const paypalToolkit = new PayPalAgentToolkit(ppConfig);
export const paypalWorkflows = new PayPalWorkflows(ppConfig);

// Test prompt
// (async () => {
//   const { text } = await generateText({
//     model: llm,
//     tools: paypalToolkit.getTools(),
//     maxSteps: 25,
//     prompt: "Say hi and tell me if Claude works!",
//   });
//   console.log("Claude says:", text);
// })();
