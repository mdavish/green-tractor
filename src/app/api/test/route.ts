import { NextResponse } from "next/server";

// TODO: Make real routes
export function GET() {
  return NextResponse.json({
    hello: "world",
  })
}