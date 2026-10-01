import { createClient } from '@supabase/supabase-js';

export default async function handler(request, response) {
    if (request.method !== 'POST') {
        response.setHeader('Allow', 'POST');
        return response.status(405).json({ error: 'Method tidak diizinkan.' });
    }

    const uploadToken = request.body?.uploadToken;
    if (!/^[0-9a-f-]{36}$/i.test(uploadToken || '')) {
        return response.status(400).json({ error: 'Token upload tidak valid.' });
    }

    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRoleKey) {
        return response.status(500).json({ error: 'Konfigurasi server Supabase belum lengkap.' });
    }

    try {
        const supabase = createClient(supabaseUrl, serviceRoleKey);
        const { data: submittedMenfess, error: menfessError } = await supabase
            .from('menfess')
            .select('id')
            .eq('image_upload_token', uploadToken)
            .maybeSingle();

        if (menfessError) {
            throw menfessError;
        }
        if (submittedMenfess) {
            return response.status(409).json({ error: 'Gambar sudah terhubung ke menfess.' });
        }

        const { data: metadata, error: metadataError } = await supabase
            .from('menfess_image_deletions')
            .select('delete_url')
            .eq('upload_token', uploadToken)
            .maybeSingle();

        if (metadataError) {
            throw metadataError;
        }
        if (!metadata) {
            return response.status(404).json({ error: 'Data upload tidak ditemukan.' });
        }

        const deleteUrl = new URL(metadata.delete_url);
        if (deleteUrl.protocol !== 'https:' || !['ibb.co', 'imgbb.com'].includes(deleteUrl.hostname)) {
            return response.status(500).json({ error: 'URL penghapusan ImgBB tidak valid.' });
        }

        const deleteResponse = await fetch(deleteUrl);
        if (!deleteResponse.ok) {
            return response.status(502).json({ error: 'ImgBB gagal membatalkan upload.' });
        }

        const { error: deleteError } = await supabase
            .from('menfess_image_deletions')
            .delete()
            .eq('upload_token', uploadToken);

        if (deleteError) {
            throw deleteError;
        }

        return response.status(200).json({ success: true });
    } catch (error) {
        console.error('Cancel image upload error:', error);
        return response.status(500).json({ error: 'Gagal membersihkan gambar yang belum terkirim.' });
    }
}
