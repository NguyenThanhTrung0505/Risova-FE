import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import '../styles/operations.css';

export default function OperationsDialog({ title, onClose, children, width = 920, position = 'top', headerAction }) {
  const titleId = useId();
  const dialogRef = useRef(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.showModal();
    return () => dialog.close();
  }, []);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <dialog
      ref={dialogRef}
      className={'operations-dialog operations-dialog--' + position}
      style={{ maxWidth: width }}
      aria-labelledby={titleId}
      onCancel={event => {
        event.preventDefault();
        onClose();
      }}
      onClick={event => {
        if (event.target !== event.currentTarget) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose();
      }}
    >
      <div className="operations-dialog-heading">
        <h2 id={titleId}>{title}</h2>
        {headerAction}
      </div>
      {children}
    </dialog>,
    document.body
  );
}
