import { serve } from "inngest/next";
import { inngest } from "@/lib/ingest";
import { helloWorld } from "@/inngest/functions";

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve(inngest, [helloWorld]);
