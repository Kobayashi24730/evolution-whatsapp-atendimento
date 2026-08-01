const API_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

export async function getChats() {
    const response = await fetch(
        `${API_URL}/chats`
    );

    return response.json();
}