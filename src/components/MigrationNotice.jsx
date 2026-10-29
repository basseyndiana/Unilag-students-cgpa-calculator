import { useApp } from '../context/AppContext';

export default function MigrationNotice() {
  const { migratedNotice, clearMigratedNotice } = useApp();

  if (!migratedNotice) return null;

  return (
    <aside className="migration-banner" role="status" aria-live="polite">
      <div className="migration-banner__content">
        <span className="migration-banner__icon">☁️</span>
        <span>
          Successfully backed up and synced <strong>{migratedNotice} semester{migratedNotice > 1 ? 's' : ''}</strong> from this device to your cloud account!
        </span>
      </div>
      <button
        type="button"
        className="btn-icon btn-icon--light"
        onClick={clearMigratedNotice}
        aria-label="Dismiss migration notification"
      >
        ✕
      </button>
    </aside>
  );
}

