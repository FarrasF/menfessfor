import { createHash } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const MAX_IMAGE_BYTES = 2_200_000;
const MAX_IMAGE_DATA_URL_LENGTH = Math.ceil(MAX_IMAGE_BYTES * 4 / 3) + 64;
const CATEGORIES = new Set(['Confess', 'Curhat', 'Akademik', 'Random']);

function responseError(res, status, message) {
    return res.status(status).json({ error: message });
}

function getJpegDimensions(buffer) {
    const startOfFrameMarkers = new Set([
        0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7,
        0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf,
    ]);
    let offset = 2;

    while (offset + 3 < buffer.length) {
        if (buffer[offset] !== 0xff) return null;
        while (buffer[offset] === 0xff) offset += 1;

        const marker = buffer[offset];
        offset += 1;
        if (marker === 0xd9 || marker === 0xda) break;
        if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd8)) continue;
        if (offset + 1 >= buffer.length) return null;

        const segmentLength = buffer.readUInt16BE(offset);
        if (segmentLength < 2 || offset + segmentLength > buffer.length) return null;

        if (startOfFrameMarkers.has(marker) && segmentLength >= 7) {
            return {
                height: buffer.readUInt16BE(offset + 3),
                width: buffer.readUInt16BE(offset + 5),
            };
        }

        offset += segmentLength;
    }

    return null;
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return responseError(res, 405, 'Method not allowed');
    }

    if (
        !process.env.IMGBB_API_URL ||
        !process.env.IMGBB_API_KEY ||
        !process.env.VITE_SUPABASE_URL ||
        !process.env.SUPABASE_SERVICE_ROLE_KEY
    ) {
        return responseError(res, 500, 'Konfigurasi upload gambar belum lengkap.');
    }

    const supabase = createClient(
        process.env.VITE_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { content, category, image } = req.body || {};
    if (
        typeof content !== 'string' ||
        !content.trim() ||
        content.trim().length > 500 ||
        !CATEGORIES.has(category)
    ) {
        return responseError(res, 400, 'Isi menfess atau kategori tidak valid.');
    }

    if (
        typeof image !== 'string' ||
        image.length > MAX_IMAGE_DATA_URL_LENGTH ||
        !image.startsWith('data:image/jpeg;base64,')
    ) {
        return responseError(res, 400, 'Gambar hasil crop tidak valid atau terlalu besar.');
    }

    const base64 = image.slice('data:image/jpeg;base64,'.length);
    if (!/^[A-Za-z0-9+/]+={0,2}$/.test(base64)) {
        return responseError(res, 400, 'Format gambar tidak valid.');
    }

    const imageBuffer = Buffer.from(base64, 'base64');
    if (
        imageBuffer.length < 3 ||
        imageBuffer[0] !== 0xff ||
        imageBuffer[1] !== 0xd8 ||
        imageBuffer[2] !== 0xff ||
        imageBuffer.length > MAX_IMAGE_BYTES
    ) {
        return responseError(res, 400, 'Gambar hasil crop maksimal 2,2 MB.');
    }
    const dimensions = getJpegDimensions(imageBuffer);
    if (!dimensions || dimensions.width !== dimensions.height) {
        return responseError(res, 400, 'Gambar harus dipotong menjadi rasio persegi 1:1.');
    }

    try {
        const forwardedIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim();
        const clientIp = forwardedIp || req.socket?.remoteAddress || 'unknown';
        const ipHash = createHash('sha256').update(clientIp).digest('hex');
        const { data: allowed, error: rateLimitError } = await supabase.rpc(
            'claim_image_upload_slot',
            { p_ip_hash: ipHash }
        );

        if (rateLimitError) throw rateLimitError;
        if (!allowed) {
            return responseError(res, 429, 'Batas unggah gambar tercapai. Coba lagi dalam satu menit.');
        }

        const formData = new FormData();
        formData.append('image', new Blob([imageBuffer], { type: 'image/jpeg' }), 'menfess-image.jpg');
        const uploadUrl = new URL(process.env.IMGBB_API_URL);
        uploadUrl.searchParams.set('key', process.env.IMGBB_API_KEY);
        const imgbbResponse = await fetch(uploadUrl, { method: 'POST', body: formData });
        const imgbbResult = await imgbbResponse.json();

        if (!imgbbResponse.ok || !imgbbResult.success) {
            console.error('ImgBB upload failed:', imgbbResult.error?.message || imgbbResponse.status);
            return responseError(res, 502, 'Gambar gagal diunggah ke ImgBB. Coba lagi.');
        }

        const imageUrl = imgbbResult.data?.image?.url || imgbbResult.data?.url;
        const deleteUrl = imgbbResult.data?.delete_url;
        if (!imageUrl || !deleteUrl) {
            return responseError(res, 502, 'ImgBB tidak mengembalikan informasi gambar yang lengkap.');
        }

        const { data: menfess, error: insertError } = await supabase
            .from('menfess')
            .insert([{
                content: content.trim(),
                category,
                status: 'pending',
                url_gambar: imageUrl,
                song_id: req.body.song_id ?? null,
                song_title: req.body.song_title ?? null,
                song_artist: req.body.song_artist ?? null,
                song_album: req.body.song_album ?? null,
                song_cover: req.body.song_cover ?? null,
                song_preview: req.body.song_preview ?? null,
            }])
            .select('id')
            .single();

        if (insertError) {
            await fetch(deleteUrl).catch(() => {});
            throw insertError;
        }

        const { error: deletionRecordError } = await supabase
            .from('menfess_image_deletions')
            .insert({ menfess_id: menfess.id, delete_url: deleteUrl });

        if (deletionRecordError) {
            await supabase.from('menfess').delete().eq('id', menfess.id);
            await fetch(deleteUrl).catch(() => {});
            throw deletionRecordError;
        }

        return res.status(201).json({ success: true, id: menfess.id });
    } catch (error) {
        console.error('Image menfess submission failed:', error);
        return responseError(res, 500, 'Menfess gagal disimpan. Pastikan database upload gambar sudah disiapkan.');
    }
}