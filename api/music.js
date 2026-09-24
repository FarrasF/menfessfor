export default {
    async fetch(request) {
        try {
            const url = new URL(request.url)
            const query = url.searchParams.get('q')

            if (!query) {
                return new Response(
                    JSON.stringify({
                        error: 'Query lagu wajib diisi',
                    }),
                    {
                        status: 400,
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    }
                )
            }

            const deezerUrl = `https://api.deezer.com/search?q=${encodeURIComponent(query)}`

            const response = await fetch(deezerUrl)

            if (!response.ok) {
                return new Response(
                    JSON.stringify({
                        error: 'Gagal mengambil data dari Deezer',
                    }),
                    {
                        status: response.status,
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    }
                )
            }

            const data = await response.json()

            const songs = data.data.map((song) => ({
                id: song.id,
                title: song.title,
                artist: song.artist.name,
                album: song.album.title,
                cover: song.album.cover_medium,
                preview: song.preview,
            }))

            return new Response(JSON.stringify(songs), {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                },
            })
        } catch (error) {
            console.error(error)

            return new Response(
                JSON.stringify({
                    error: 'Terjadi kesalahan pada server',
                }),
                {
                    status: 500,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            )
        }
    },
}