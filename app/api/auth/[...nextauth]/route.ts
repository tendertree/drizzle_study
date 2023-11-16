import NextAuth from "next-auth"
import NaverProvider from "next-auth/providers/naver";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { SupabaseAdapter } from "@auth/supabase-adapter";
import { compare } from "bcrypt";
import jwt from "jsonwebtoken";
import { checkCustomEmail, checkEmailAlreadyExist } from "@/app/lab/action";
import supabase from "@/src/provider/supabase";
const handler = NextAuth({
	adapter: SupabaseAdapter({
		url: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
		secret: process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || "",
	}),
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID || "",
			clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
		}),
		CredentialsProvider({
			name: 'Credentials',
			credentials: {
				email: { label: 'eamil', type: 'text', placeholder: 'email' },
				password: { label: 'Password', type: 'password' },
			},
			async authorize(credentials, req) {
				try {
					const { data, error: queryError } = await supabase
						.from('users')
						.select()
						.eq("email", credentials?.email);
					if (queryError) {
						console.error('Error checking for existing user:', queryError);
						throw new Error('Query Error Server Error');
					}
					if (data[0] && data.length > 0) {
						const validPassword = await compare(credentials?.password, data[0].password);

						if (!validPassword) {
							console.log("invalid password");
							return null
						}
						console.log("login succeded");

						return {
							id: data[0].id,
							email: data[0].email,
						};
					};
					console.log("user dosen't exist");
					return null;


				} catch (error) {
					console.error('error happend', error);
					return null;
				}
			}
		}),
	],

	callbacks: {
		async redirect({ url, baseUrl }) {
			// Allows relative callback URLs
			if (url.startsWith("/")) return `${baseUrl}${url}`
			// Allows callback URLs on the same origin
			else if (new URL(url).origin === baseUrl) return url
			return baseUrl

		},
		async signIn(user, accont, profile, email) {
			const emailExists = await checkEmailAlreadyExist(user.email);
			if (emailExists) { return true }
			return '/signup?' + new URLSearchParams({ email: user.email || '' });

		},
		async jwt({ token, user }) {
			return { ...token, ...user };
		},

		async session({ session, token }) {
			session.user = token as any;
			return session;
		},
	},
	session: {
		strategy: "jwt",
	},
	secret:
		"3cc80b75056bd4ab892c977d6b9f7bd2bab0d52e487254463522a09e6f116c1b69a1d8f31ea5100e2efbffc2840f43d1",
	pages: {
		error: "/error",
		signIn: "/signin"
	},

})

export { handler as GET, handler as POST }
