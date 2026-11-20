import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export default function Dialog({ title, onClose, children, width = 640, placement = 'center' }) {
  const ref = useRef(null);
  const titleId = useId();
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    dialog.showModal();
    return () => dialog.close();
  }, []);
  if (typeof document === 'undefined') return null;
  return createPortal(<dialog ref={ref} className="risova-native-dialog" data-placement={placement} style={{ maxWidth: width }} aria-labelledby={titleId}
    onCancel={event => { event.preventDefault(); onClose(); }}
    onClick={event => { if (event.target === event.currentTarget) { const rect = event.currentTarget.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose(); } }}>
    <div className="risova-dialog-heading"><h2 id={titleId}>{title}</h2><button type="button" className="risova-icon-button" aria-label="Đóng hộp thoại" onClick={onClose}><X size={20} /></button></div>
    <div className="risova-dialog-body">{children}</div>
  </dialog>, document.body);
}
