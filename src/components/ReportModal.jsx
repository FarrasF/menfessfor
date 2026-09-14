import { useState } from 'react';
import './ReportModal.css';

/**
 * ReportModal — Placeholder component for reporting menfess or comments.
 *
 * This component will be fully implemented when the Supabase
 * integration is ready. For now it provides the UI shell.
 */

const REPORT_REASONS = [
  'Konten tidak pantas',
  'Spam',
  'Ujaran kebencian',
  'Informasi palsu',
  'Lainnya',
];

function ReportModal({ isOpen, onClose, targetType = 'menfess', targetId }) {
  const [selectedReason, setSelectedReason] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    // Future: send report to Supabase
    console.log('Report submitted:', { targetType, targetId, selectedReason, additionalInfo });
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setSelectedReason('');
      setAdditionalInfo('');
      onClose();
    }, 2000);
  };

  return (
    <div className="report-modal__overlay" onClick={onClose}>
      <div
        className="report-modal clay-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`Laporkan ${targetType}`}
      >
        {submitted ? (
          <div className="report-modal__success">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <p>Laporan terkirim!</p>
          </div>
        ) : (
          <>
            <div className="report-modal__header">
              <h3>Laporkan {targetType === 'menfess' ? 'Menfess' : 'Komentar'}</h3>
              <button className="report-modal__close" onClick={onClose} aria-label="Tutup">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="report-modal__reasons">
                {REPORT_REASONS.map((reason) => (
                  <label key={reason} className="report-modal__reason">
                    <input
                      type="radio"
                      name="report-reason"
                      value={reason}
                      checked={selectedReason === reason}
                      onChange={(e) => setSelectedReason(e.target.value)}
                      required
                    />
                    <span className="report-modal__reason-label">{reason}</span>
                  </label>
                ))}
              </div>

              <textarea
                className="report-modal__textarea clay-input"
                placeholder="Informasi tambahan (opsional)"
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                rows={3}
                maxLength={300}
              />

              <button type="submit" className="clay-button clay-button--primary report-modal__submit">
                Kirim Laporan
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default ReportModal;
