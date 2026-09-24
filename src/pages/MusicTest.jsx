import { useState } from 'react'
import { searchMusic } from '../lib/music'

function MusicTest() {
    const [query, setQuery] = useState('')
    const [songs, setSongs] = useState([])

    async function handleSearch() {
        try {
            const results = await searchMusic(query)

            console.log('HASIL MUSIC:', results)

            setSongs(results)
        } catch (error) {
            console.error('SEARCH ERROR:', error)
        }
    }

    return (
        <div>
            <h1>Music Test</h1>

            <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari lagu"
            />

            <button onClick={handleSearch}>
                Cari
            </button>

            {songs.map((song) => (
                <div key={song.id}>
                    <h2>{song.title}</h2>
                    <p>{song.artist}</p>

                    <img
                        src={song.cover}
                        width="100"
                        alt={song.title}
                    />

                    <br />

                    <audio
                        controls
                        src={song.preview}
                    />
                </div>
            ))}
        </div>
    )
}

export default MusicTest