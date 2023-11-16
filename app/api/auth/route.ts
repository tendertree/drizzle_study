import { NextRequest, NextResponse } from "next/server";


export async function GET(request: NextRequest) {
	const result = { a: "name" };
	return NextResponse.json({ "porduc": "arst" });
}


export async function POST(request: NextRequest) {
	const data = await request.json();
	return NextResponse.json(data);
}

