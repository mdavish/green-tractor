import { serve } from "inngest/next";
import { inngest, allFunctions } from "@/lib/inngest";

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve(inngest, allFunctions);
