export async function getChats() {
    const response = await fetch('http://localhost:8080/api/v1/chats', {
        headers: {
            apikey: '300062F59970-4A9E-8859-7FC9CA1268A9'
        }
    });

    const data = await response.json()
    console.log(data);
    return data
}