const API_URL = "http://localhost:5000";

export async function getChats() {
    const response = await fetch(
        `${API_URL}/chats`
    );

    return response.json();
}