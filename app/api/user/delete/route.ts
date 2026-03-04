import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, accounts, sessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "auth";

// DELETE - 删除用户账户
export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // 删除用户（通过级联删除会自动清除关联的 accounts、sessions 等）
    await db.delete(users).where(eq(users.id, userId));

    return NextResponse.json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user account:", error);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }
}


