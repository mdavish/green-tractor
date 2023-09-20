import { serve } from "inngest/next";
import { inngestClient, allFunctions } from "@/lib/inngest";

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve(inngestClient, allFunctions);
