import { createClient } from '@supabase/supabase-js';

function getSupabaseClients() {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const publishableKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !publishableKey || !serviceRoleKey) {
        throw new Error('Konfigurasi server Supabase belum lengkap.');
    }

    return {
        authClient: createClient(supabaseUrl, publishableKey),
        serviceClient: createClient(supabaseUrl, serviceRoleKey),
    };
}

export default async function handler(request, response) {
    if (request.method !== 'POST') {
        response.setHeader('Allow', 'POST');
        return response.status(405).json({ error: 'Method tidak diizinkan.' });
    }

    const accessToken = request.headers.authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
    const menfessId = request.body?.menfessId;

    if (!accessToken || !menfessId) {
        return response.status(401).json({ error: 'Sesi moderator tidak ditemukan.' });
    }

    try {
        const { authClient, serviceClient } = getSupabaseClients();
        const { data: { user }, error: authError } = await authClient.auth.getUser(accessToken);

        if (authError || !user) {
            return response.status(401).json({ error: 'Sesi moderator tidak valid.' });
        }

        const { data: moderator, error: moderatorError } = await serviceClient
            .from('moderators')
            .select('user_id')
            .eq('user_id', user.id)
            .maybeSingle();

        if (moderatorError || !moderator) {
            return response.status(403).json({ error: 'Aksi ini hanya tersedia untuk moderator.' });
        }

        const { data: menfess, error: menfessError } = await serviceClient
            .from('menfess')
            .select('id, status, url_gambar, image_upload_token')
            .eq('id', menfessId)
            .eq('status', 'pending')
            .maybeSingle();

        if (menfessError || !menfess?.url_gambar || !menfess.image_upload_token) {
            return response.status(404).json({ error: 'Gambar pending tidak ditemukan.' });
        }

        const { data: imageMetadata, error: metadataError } = await serviceClient
            .from('menfess_image_deletions')
            .select('upload_token, delete_url')
            .eq('upload_token', menfess.image_upload_token)
            .eq('image_url', menfess.url_gambar)
            .maybeSingle();

        if (metadataError || !imageMetadata) {
            return response.status(404).json({ error: 'Data penghapusan gambar tidak ditemukan.' });
        }

        const deleteUrl = new URL(imageMetadata.delete_url);
        if (deleteUrl.protocol !== 'https:' || !['ibb.co', 'imgbb.com'].includes(deleteUrl.hostname)) {
            return response.status(500).json({ error: 'URL penghapusan ImgBB tidak valid.' });
        }

        const deleteResponse = await fetch(deleteUrl);
        if (!deleteResponse.ok) {
            return response.status(502).json({ error: 'ImgBB gagal menghapus gambar.' });
        }

        const { error: updateError } = await serviceClient
            .from('menfess')
            .update({ url_gambar: null, image_upload_token: null })
            .eq('id', menfess.id)
            .eq('status', 'pending');

        if (updateError) {
            console.error('ImgBB image deleted but menfess update failed:', updateError);
            return response.status(500).json({ error: 'Gambar terhapus dari ImgBB, tetapi data menfess gagal diperbarui.' });
        }

        const { error: cleanupError } = await serviceClient
            .from('menfess_image_deletions')
            .delete()
            .eq('upload_token', imageMetadata.upload_token);

        if (cleanupError) {
            console.error('Could not remove ImgBB deletion metadata:', cleanupError);
        }

        return response.status(200).json({ success: true });
    } catch (error) {
        console.error('Delete image error:', error);
        return response.status(500).json({ error: 'Gagal menghapus gambar.' });
    }
}
