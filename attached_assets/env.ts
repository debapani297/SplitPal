// server/config/config.ts

import { config } from "@dotenvx/dotenvx";
import {
  PayPalAgentToolkit,
  PayPalWorkflows,
  ALL_TOOLS_ENABLED,
} from "@paypal/agent-toolkit/ai-sdk";
import anthropic from "@anthropic-ai/sdk";

// Load env file
const envFilePath = process.env.ENV_FILE_PATH || ".env";
config({ path: envFilePath });

// Warn if Claude key is missing
if (!process.env.ANTHROPIC_API_KEY) {
  console.warn(
    "Warning: ANTHROPIC_API_KEY is missing. Claude-powered payment functions will not work."
  );
}

// Claude model (Sonnet)
export const llm = anthropic("claude-3-7-sonnet-20250219");

// PayPal Agent SDK configuration
const ppConfig = {
  clientId: process.env.PAYPAL_CLIENT_ID || "",
  clientSecret: process.env.PAYPAL_CLIENT_SECRET || "",
  configuration: {
    actions: ALL_TOOLS_ENABLED,
  },
};

// Initialize PayPal agent tools
export const paypalToolkit = new PayPalAgentToolkit(ppConfig);
export const paypalWorkflows = new PayPalWorkflows(ppConfig);
