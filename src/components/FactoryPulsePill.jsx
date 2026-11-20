import { useNavigate } from 'react-router-dom';
import { Activity, ArrowRight } from 'lucide-react';
import { useAuth, useData } from '../context/DataContext';
import { canAccessPage } from '../constants/permissions';
import './FactoryPulsePill.css';

export default function FactoryPulsePill({ isOpen, onToggle, onClose, onNavigate }) {
  const { currentUser } = useAuth();
  const { data } = useData();
  const routeNavigate = useNavigate();

  const role = currentUser?.role;
  const canViewAssets = canAccessPage(role, 'assets');
  const canViewIot = canAccessPage(role, 'iot');

  const assets = data.assets || [];
  const activeCount = assets.filter((a) => a.status === 'ACTIVE').length;
  const brokenCount = assets.filter((a) => a.status === 'BROKEN' || a.status === 'FAILED').length;
  const avgHealth = assets.length
    ? Math.round(assets.reduce((sum, a) => sum + Number(a.health_score ?? 100), 0) / assets.length)
    : 100;
  const openAlerts = (data.alerts || []).filter((a) => a.status === 'OPEN');

  const lowestHealthAsset = assets.length
    ? assets.reduce((lowest, item) =>
        Number(item.health_score ?? 100) < Number(lowest.health_score ?? 100) ? item : lowest
      )
    : null;

  const severity =
    openAlerts.length > 0 || brokenCount > 0
      ? 'critical'
      : avgHealth < 85
        ? 'caution'
        : 'healthy';

  const statusMeta = {
    critical: {
      tag: 'Cần chú ý',
      pillText: openAlerts.length ? `${openAlerts.length} cảnh báo` : `${brokenCount} máy hỏng`,
      pulseColor: '#ef4444',
    },
    caution: {
      tag: 'Theo dõi',
      pillText: `${avgHealth}% Sức khỏe`,
      pulseColor: '#f59e0b',
    },
    healthy: {
      tag: 'Ổn định',
      pillText: `${avgHealth}% Sức khỏe`,
      pulseColor: '#10b981',
    },
  }[severity];

  return (
    <div className="risova-pulse-wrap" data-popover>
      <button
        type="button"
        className={`risova-pulse-pill is-${severity}`}
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-label={`Nhịp vận hành nhà máy: ${statusMeta.tag}`}
        title="Nhịp vận hành & Sức khỏe nhà máy"
      >
        <span className="risova-pulse-dot" aria-hidden="true" />
        <svg className="risova-pulse-ecg" viewBox="0 0 36 16" aria-hidden="true">
          <path
            className="risova-pulse-ecg-base"
            pathLength="100"
            d="M 0 8 L 9 8 L 12 3 L 16 14 L 20 2 L 24 11 L 27 8 L 36 8"
          />
          <path
            className="risova-pulse-ecg-trace"
            pathLength="100"
            d="M 0 8 L 9 8 L 12 3 L 16 14 L 20 2 L 24 11 L 27 8 L 36 8"
          />
        </svg>
        <span className="risova-pulse-label">{statusMeta.pillText}</span>
      </button>

      {isOpen && (
        <div
          className="risova-popover risova-pulse-popover"
          style={{ '--pulse-color': statusMeta.pulseColor }}
        >
          <div className="risova-pulse-popover-head">
            <strong>Nhịp vận hành nhà máy</strong>
            <span className={`risova-pulse-status-tag is-${severity}`}>
              {statusMeta.tag}
            </span>
          </div>

          <div className="risova-pulse-monitor-box">
            <svg className="risova-pulse-monitor-wave" viewBox="0 0 180 38" aria-hidden="true">
              <path
                className="is-bg"
                pathLength="100"
                d="M 0 20 L 34 20 L 42 12 L 50 31 L 60 5 L 70 28 L 78 20 L 114 20 L 122 14 L 129 29 L 138 8 L 146 25 L 154 20 L 180 20"
              />
              <path
                className="is-live"
                pathLength="100"
                d="M 0 20 L 34 20 L 42 12 L 50 31 L 60 5 L 70 28 L 78 20 L 114 20 L 122 14 L 129 29 L 138 8 L 146 25 L 154 20 L 180 20"
              />
            </svg>
            <div className="risova-pulse-monitor-score">
              <strong>{avgHealth}%</strong>
              <small>Sức khỏe TB</small>
            </div>
          </div>

          <div className="risova-pulse-stats">
            <div className="risova-pulse-stat">
              <strong>
                {activeCount}/{assets.length}
              </strong>
              <small>Đang chạy</small>
            </div>
            <div className="risova-pulse-stat">
              <strong>{brokenCount}</strong>
              <small>Đang hỏng</small>
            </div>
            <div className="risova-pulse-stat">
              <strong>{openAlerts.length}</strong>
              <small>Cảnh báo mở</small>
            </div>
          </div>

          {lowestHealthAsset && (
            <button
              type="button"
              className="risova-pulse-focus-asset"
              disabled={!canViewAssets}
              onClick={() => {
                if (!canViewAssets) return;
                onClose?.();
                routeNavigate(`/equipment?asset=${lowestHealthAsset.id}`);
              }}
            >
              <span>
                <strong>{lowestHealthAsset.name}</strong>
                <small>
                  {lowestHealthAsset.asset_code} · Thiết bị cần ưu tiên kiểm tra
                </small>
              </span>
              <span
                className={`risova-pulse-focus-score${
                  Number(lowestHealthAsset.health_score ?? 100) >= 50 ? ' is-ok' : ''
                }`}
              >
                <span>{lowestHealthAsset.health_score ?? 0}%</span>
                {canViewAssets && <ArrowRight size={12} />}
              </span>
            </button>
          )}

          {canViewIot && (
            <button
              type="button"
              className="risova-pulse-footer-link"
              onClick={() => {
                onClose?.();
                onNavigate?.('iot');
              }}
            >
              <Activity size={14} />
              <span>Mở Trung tâm Giám sát IoT</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
