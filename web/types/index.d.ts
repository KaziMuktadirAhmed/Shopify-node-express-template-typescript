import { Session } from "@shopify/shopify-api";

// Extend Express Response.locals to include Shopify session
declare global {
  namespace Express {
    interface Locals {
      shopify: {
        session: Session;
      };
    }
  }
}

// Export this to make it a module
export {};
