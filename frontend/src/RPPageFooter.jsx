
import "./RPPageFooter.css";

export default function RPPageFooter({
  page,
  note,
  onBack,
}) {
  return (
    <footer className="rp-shared-footer">
      <div className="rp-shared-footer__brand">
        <strong>RP-FVIP /</strong>
        <span>{page}</span>
      </div>

      <div className="rp-shared-footer__note">
        {note}
      </div>

      {onBack && (
        <button
          className="rp-shared-footer__button"
          type="button"
          onClick={onBack}
        >
          Back to Dashboard
        </button>
      )}
    </footer>
  );
}
