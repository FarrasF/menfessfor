import { createHmac, randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

export const config = {
    api: {
        bodyParser: false,
    },
};

const MAX_UPLOAD_BYTES = 3.5 * 1024 * 1024;
const UPLOAD_LIMIT = 5;
const UPLOAD_WINDOW_SECONDS = 60;

function getServiceClient() {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
        throw new Error('Konfigurasi server Supabase belum lengkap.');
    }

    return createClient(supabaseUrl, serviceRoleKey);
}

async function readRequestBody(request) {
    const chunks = [];
    let totalBytes = 0;

    for await (const chunk of request) {
        totalBytes += chunk.length;
        if (totalBytes > MAX_UPLOAD_BYTES) {
            throw new Error('Ukuran hasil crop maksimal 3,5 MB.');
        }
        chunks.push(chunk);
    }

    return Buffer.concat(chunks);
}

function getClientAddress(request) {
    const forwardedFor = request.headers['x-forwarded-for'];
    if (forwardedFor) {
        return String(forwardedFor).split(',').at(-1).trim();
    }

    return request.socket?.remoteAddress || 'unknown';
}

export default async function handler(request, response) {
    if (request.method !== 'POST') {
        response.setHeader('Allow', 'POST');
        return response.status(405).json({ error: 'Method tidak diizinkan.' });
    }

    const apiKey = process.env.IMGBB_API_KEY;
    const uploadUrl = process.env.IMGBB_UPLOAD_URL;

    if (!apiKey || !uploadUrl) {
        return response.status(500).json({ error: 'Konfigurasi ImgBB belum tersedia di server.' });
    }

    if (request.headers['content-type'] !== 'image/jpeg') {
        return response.status(415).json({ error: 'Hanya hasil crop gambar JPEG yang dapat diunggah.' });
    }

    try {
        const supabase = getServiceClient();
        const clientAddress = getClientAddress(request);
        const rateLimitKey = createHmac('sha256', process.env.SUPABASE_SERVICE_ROLE_KEY)
            .update(clientAddress)
            .digest('hex');
        const { data: allowed, error: rateLimitError } = await supabase.rpc(
            'consume_imgbb_upload_rate_limit',
            {
                p_ip_hash: rateLimitKey,
                p_limit: UPLOAD_LIMIT,
                p_window_seconds: UPLOAD_WINDOW_SECONDS,
            }
        );

        if (rateLimitError) {
            console.error('ImgBB rate-limit check failed:', rateLimitError);
            return response.status(500).json({ error: 'Pembatasan unggahan belum siap. Coba lagi nanti.' });
        }

        if (!allowed) {
            return response.status(429).json({ error: 'Terlalu banyak unggahan. Coba lagi dalam satu menit.' });
        }

        const image = await readRequestBody(request);
        if (image.length < 4 || image[0] !== 0xff || image[1] !== 0xd8 || image[2] !== 0xff) {
            return response.status(400).json({ error: 'File yang dikirim bukan gambar JPEG yang valid.' });
        }

        const target = new URL(uploadUrl);
        if (target.protocol !== 'https:' || target.hostname !== 'api.imgbb.com') {
            return response.status(500).json({ error: 'URL layanan ImgBB tidak valid.' });
        }
        target.searchParams.set('key', apiKey);

        const form = new FormData();
        form.append('image', new Blob([image], { type: 'image/jpeg' }), 'menfess.jpg');
        const uploadResponse = await fetch(target, { method: 'POST', body: form });
        const uploadResult = await uploadResponse.json();

        if (!uploadResponse.ok || !uploadResult.success || !uploadResult.data?.display_url || !uploadResult.data?.delete_url) {
            console.error('ImgBB upload failed:', uploadResult.error?.message || uploadResponse.status);
            return response.status(502).json({ error: 'ImgBB gagal menyimpan gambar.' });
        }

        const uploadToken = randomUUID();
        const { error: saveError } = await supabase
            .from('menfess_image_deletions')
            .insert({
                upload_token: uploadToken,
                image_url: uploadResult.data.display_url,
                delete_url: uploadResult.data.delete_url,
            });

        if (saveError) {
            try {
                await fetch(uploadResult.data.delete_url);
            } catch (cleanupError) {
                console.error('Could not clean up untracked ImgBB upload:', cleanupError);
            }
            console.error('Could not save ImgBB deletion metadata:', saveError);
            return response.status(500).json({ error: 'Metadata gambar gagal disimpan.' });
        }

        return response.status(200).json({
            imageUrl: uploadResult.data.display_url,
            uploadToken,
        });
    } catch (error) {
        const isOversized = error.message?.includes('maksimal 3,5 MB');
        return response.status(isOversized ? 413 : 500).json({
            error: error.message || 'Terjadi kesalahan saat mengunggah gambar.',
        });
    }
}
