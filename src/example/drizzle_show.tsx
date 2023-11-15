import { db } from "@/db/drizzle";
import { users } from "@/db/schema/schema";

export default async function Play_drizzle() {
	const allUsers = await db.select().from(users);

	return (
		<div>arst</div>
	)
}
