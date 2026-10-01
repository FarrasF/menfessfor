import { createClient } from '@supabase/supabase-js';

function responseError(res, status, message) {
    return res.status(status).json({ error: message });
}

function isImgBBDeleteUrl(value) {
    try {
        const { hostname, protocol } = new URL(value);
        return protocol === 'https:' && (
            hostname === 'ibb.co' ||
            hostname === 'imgbb.com' ||
            hostname.endsWith('.imgbb.com')
        );
    } catch {
        return false;
    }
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return responseError(res, 405, 'Method not allowed');
    }

    if (!process.env.VITE_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        return responseError(res, 500, 'Konfigurasi moderasi gambar belum lengkap.');
    }

    const supabase = createClient(
        process.env.VITE_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const token = req.headers.authorization?.match(/^Bearer (.+)$/)?.[1];
    if (!token) return responseError(res, 401, 'Sesi moderator diperlukan.');

    try {
        const { data: authData, error: authError } = await supabase.auth.getUser(token);
        if (authError || !authData.user) {
            return responseError(res, 401, 'Sesi moderator tidak valid.');
        }

        const { data: moderator, error: moderatorError } = await supabase
            .from('moderators')
            .select('user_id')
            .eq('user_id', authData.user.id)
            .maybeSingle();

        if (moderatorError) throw moderatorError;
        if (!moderator) return responseError(res, 403, 'Akses moderator diperlukan.');

        const menfessId = Number(req.body?.menfessId);
        if (!Number.isSafeInteger(menfessId) || menfessId < 1) {
            return responseError(res, 400, 'ID menfess tidak valid.');
        }

        const { data: deletion, error: deletionError } = await supabase
            .from('menfess_image_deletions')
            .select('delete_url')
            .eq('menfess_id', menfessId)
            .maybeSingle();

        if (deletionError) throw deletionError;
        if (!deletion || !isImgBBDeleteUrl(deletion.delete_url)) {
            return responseError(res, 404, 'Data penghapusan gambar tidak ditemukan.');
        }

        const deleteResponse = await fetch(deletion.delete_url);
        const alreadyDeleted = [404, 410].includes(deleteResponse.status);
        if ((!deleteResponse.ok && !alreadyDeleted) || !isImgBBDeleteUrl(deleteResponse.url)) {
            return responseError(res, 502, 'ImgBB gagal menghapus gambar.');
        }

        const { error: updateError } = await supabase
            .from('menfess')
            .update({ url_gambar: null })
            .eq('id', menfessId);

        if (updateError) throw updateError;

        const { error: cleanupError } = await supabase
            .from('menfess_image_deletions')
            .delete()
            .eq('menfess_id', menfessId);

        if (cleanupError) throw cleanupError;

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Image moderation failed:', error);
        return responseError(res, 500, 'Gambar gagal dihapus. Coba lagi.');
    }
}