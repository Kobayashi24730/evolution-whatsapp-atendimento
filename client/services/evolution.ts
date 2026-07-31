const API_EVOLUTION =  process.env.EVOLUTION_API_URL || "localhost:8080"
export async function getChats() {
    const response = await fetch(API_EVOLUTION, {
        headers: {
            apikey: process.env.EVOLUTION_API_KEY || ""
        }
    });

    const data = await response.json()
    console.log(data);
    return data
}