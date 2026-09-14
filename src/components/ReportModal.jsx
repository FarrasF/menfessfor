import { useState } from 'react';
import './ReportModal.css';

/**
 * ReportModal — Modal for reporting menfess or comments in GitHub Dialog style.
 */
const REPORT_REASONS = [
  'Konten tidak pantas atau pornografi',
  'Spam atau iklan terselubung',
  'Ujaran kebencian atau pelecehan',
  'Informasi palsu / disinformasi',
  'Lainnya',
];

function ReportModal({ isOpen, onClose, targetType = 'menfess', targetId }) {
  const [selectedReason, setSelectedReason] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Report submitted:', { targetType, targetId, selectedReason, additionalInfo });
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setSelectedReason('');
      setAdditionalInfo('');
      onClose();
    }, 1800);
  };

  return (
    <div className="gh-dialog-backdrop" onClick={onClose}>
      <div
        className="gh-dialog"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-dialog-title"
      >
        {submitted ? (
          <div className="gh-dialog__success">
            <svg width="32" height="32" viewBox="0 0 16 16" fill="var(--color-success-fg)" aria-hidden="true">
              <path d="M8 16A8 8 0 1 1 8 0a8 8 0 0 1 0 16Zm3.78-9.72a.751.751 0 0 0-.018-1.042.751.751 0 0 0-1.042-.018L6.75 9.19 5.28 7.72a.751.751 0 0 0-1.042.018.751.751 0 0 0 .018 1.042l2 2a.75.75 0 0 0 1.06 0Z" />
            </svg>
            <p className="gh-dialog__success-text">Laporan berhasil dikirim ke antrean moderasi.</p>
          </div>
        ) : (
          <>
            <div className="gh-dialog__header">
              <h2 id="report-dialog-title" className="gh-dialog__title">
                Laporkan {targetType === 'menfess' ? 'Menfess' : 'Komentar'}
              </h2>
              <button className="gh-dialog__close" onClick={onClose} aria-label="Tutup dialog">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                  <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734L9.06 8l3.22 3.22a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L8 9.06l-3.22 3.22a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="gh-dialog__form">
              <div className="gh-dialog__body">
                <div className="gh-dialog__reasons">
                  <span className="gh-dialog__section-label">Pilih alasan pelaporan:</span>
                  {REPORT_REASONS.map((reason) => (
                    <label key={reason} className="gh-dialog__reason-option">
                      <input
                        type="radio"
                        name="report-reason"
                        value={reason}
                        checked={selectedReason === reason}
                        onChange={(e) => setSelectedReason(e.target.value)}
                        required
                      />
                      <span>{reason}</span>
                    </label>
                  ))}
                </div>

                <div className="gh-dialog__field">
                  <label htmlFor="report-additional-info" className="gh-dialog__section-label">
                    Detail tambahan (opsional)
                  </label>
                  <textarea
                    id="report-additional-info"
                    className="gh-input gh-dialog__textarea"
                    placeholder="Bantu moderator memahami konteks masalah ini..."
                    value={additionalInfo}
                    onChange={(e) => setAdditionalInfo(e.target.value)}
                    rows={3}
                    maxLength={300}
                  />
                </div>
              </div>

              <div className="gh-dialog__footer">
                <button type="button" className="gh-btn" onClick={onClose}>
                  Batal
                </button>
                <button
                  type="submit"
                  className="gh-btn gh-btn-danger"
                  disabled={!selectedReason}
                >
                  Kirim Laporan
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default ReportModal;
