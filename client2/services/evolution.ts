export async function getChats() {
    const response = await fetch('http://evolution_api:8080/api/v1/chats', {
        headers: {
            apikey: '7996256f-dfb9-4028-9fa3-1ed9a2f8b640'
        }
    });

    const data = await response.json()
    console.log(data);
    return data
}