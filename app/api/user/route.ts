import supabase from "@/src/provider/supabase";
import { NextResponse } from "next/server"
import { hash } from 'bcrypt'

export async function GET() {


	return NextResponse.json({ success: true })
}


export async function POST(req: Request) {
	try {
		const body = await req.json();
		const { email, name, password } = body;
		// Check if the username or email already exists
		const { data, error: queryError } = await supabase
			.from('users')
			.select()
			.eq("name", name).eq("email", email);
		if (queryError) {
			console.error('Error checking for existing user:', queryError);
			throw new Error('alredy data exist Server Error');
		}
		if (data && data.length > 0) {
			throw new Error('Username or email already in use');
		}
		const hashedPassword = await hash(password, 10);
		const { error: registrationError } = await supabase.from('users').insert([
			{ name, email, password: hashedPassword },
		]);
		if (registrationError) {
			console.error('Error during registration:', registrationError);
			throw new Error('Internal Server Error');
		}
		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Unhandled error:', error);
		return NextResponse.json({ success: false, error: 'Internal Server Error' });
	}
}
