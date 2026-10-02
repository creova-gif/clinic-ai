import {
  PRODUCT_HOLD_NOTICE,
  UNVALIDATED_TRIAGE_BANNER,
} from '@/app/services/clinicalProductHold';

interface ClinicalUseNoticeProps {
  mode: 'hold' | 'unvalidated';
}

/**
 * Persistent bilingual notice for triage surfaces.
 * hold: product hold, no clinical output.
 * unvalidated: shown on every result when the pilot flag is on.
 */
export function ClinicalUseNotice({ mode }: ClinicalUseNoticeProps) {
  const copy = mode === 'hold' ? PRODUCT_HOLD_NOTICE : UNVALIDATED_TRIAGE_BANNER;
  const hold = mode === 'hold';

  return (
    <aside
      role={hold ? 'status' : 'note'}
      aria-live="polite"
      data-clinical-notice={mode}
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        margin: 0,
        padding: '12px 16px',
        background: hold ? '#7F1D1D' : '#78350F',
        color: '#FFFFFF',
        borderBottom: hold ? '3px solid #FECACA' : '3px solid #FDE68A',
      }}
    >
      <p lang="en" style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 700, lineHeight: 1.4 }}>
        {copy.en}
      </p>
      <p lang="sw" style={{ margin: 0, fontSize: 14, fontWeight: 600, lineHeight: 1.4 }}>
        {copy.sw}
      </p>
    </aside>
  );
}
