export async function searchMusic(query) {
    if (!query || !query.trim()) return []

    try {
        const response = await fetch(
            `/api/music?q=${encodeURIComponent(query)}`
        )

        if (!response.ok) {
            throw new Error('Gagal mencari lagu')
        }

        return await response.json()
    } catch (error) {
        console.error('Music search error:', error)
        throw error
    }
}