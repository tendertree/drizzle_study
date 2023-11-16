import supabase from "@/src/provider/supabase";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
	try {
		const body = await req.json();
		const { email, username, passowrd } = body;
		const { data, error } = await supabase.from('users').select('name').eq('name', name);
		if (error) {
			console.log("supabase error");

		}

		if (data && data.length > 0) {
			return NextResponse.json({ user: null, message: "User already exists" }, { status: 409 })
		}

	} catch (error) {

	}
}


