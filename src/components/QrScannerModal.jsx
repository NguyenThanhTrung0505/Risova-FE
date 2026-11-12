import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { useData } from '../context/DataContext';
import {
  QrCode,
  Camera,
  Upload,
  X,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Wrench,
  Eye,
  Layers,
  Building2,
  FileSearch
} from 'lucide-react';

export default function QrScannerModal({ isOpen, onClose, onViewAsset, onCreateWoForAsset }) {
  const { data, ENUMS } = useData();
  const [mode, setMode] = useState('CAMERA'); // 'CAMERA' or 'FILE'
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState(null);
  const [scannedText, setScannedText] = useState(null);
  const [matchedAsset, setMatchedAsset] = useState(null);

  const html5QrCodeRef = useRef(null);
  const fileInputRef = useRef(null);

  // Helper to extract clean asset code from decoded text / URL
  const extractAssetCode = (rawText) => {
    if (!rawText) return '';
    const clean = rawText.trim();
    // e.g. "https://risova.vn/qr/AC-04" -> "AC-04"
    if (clean.includes('/qr/')) {
      const parts = clean.split('/qr/');
      const codePart = parts[parts.length - 1];
      return codePart.split('?')[0].split('/')[0].trim();
    }
    return clean;
  };

  // Find asset from database
  const processDecodedText = (decoded) => {
    setScannedText(decoded);
    const code = extractAssetCode(decoded);

    const asset = data.assets.find(
      a => a.asset_code.toUpperCase() === code.toUpperCase() ||
           a.asset_code.toUpperCase() === decoded.toUpperCase()
    );

    setMatchedAsset(asset || null);
  };

  // Stop camera stream safely
  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        html5QrCodeRef.current.clear();
      } catch (err) {
        console.warn('Error stopping scanner:', err);
      }
      setIsScanning(false);
    }
  };

  // Start live webcam scanner
  const startCamera = async () => {
    setScanError(null);
    try {
      // Ensure any existing instance is cleaned up
      await stopScanner();

      const element = document.getElementById('qr-scanner-viewport');
      if (!element) return;

      const html5QrCode = new Html5Qrcode('qr-scanner-viewport');
      html5QrCodeRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 220, height: 220 }
        },
        async (decodedText) => {
          // Success callback
          await stopScanner();
          processDecodedText(decodedText);
        },
        () => {
          // Frame error (silently ignore)
        }
      );

      setIsScanning(true);
    } catch (err) {
      console.warn('Camera failed:', err);
      setIsScanning(false);
      setScanError(
        'Không thể mở Camera (Có thể do thiết bị chưa cấp quyền hoặc không có Webcam). Bạn hãy chuyển sang chế độ "Tải ảnh QR lên" để quét nhé!'
      );
    }
  };

  // Effect: manage camera when modal opens/closes or mode changes
  useEffect(() => {
    if (isOpen && mode === 'CAMERA' && !scannedText) {
      // Delay slightly to let DOM render #qr-scanner-viewport
      const timer = setTimeout(() => {
        startCamera();
      }, 250);
      return () => {
        clearTimeout(timer);
        stopScanner();
      };
    } else {
      stopScanner();
    }
  }, [isOpen, mode, scannedText]);

  // Handle file upload scan
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanError(null);
    try {
      // Create a temporary scanner element for file scanning
      let fileScanner = html5QrCodeRef.current;
      if (!fileScanner) {
        fileScanner = new Html5Qrcode('qr-scanner-file-hidden');
        html5QrCodeRef.current = fileScanner;
      }

      const decodedText = await fileScanner.scanFile(file, true);
      processDecodedText(decodedText);
    } catch (err) {
      console.warn('File scan error:', err);
      setScanError('Không thể tìm thấy hoặc giải mã mã QR từ ảnh này. Vui lòng chọn ảnh QR rõ nét hơn.');
    } finally {
      // Reset input value so same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleResetScan = () => {
    setScannedText(null);
    setMatchedAsset(null);
    setScanError(null);
    if (mode === 'CAMERA') {
      setTimeout(() => startCamera(), 150);
    }
  };

  const handleClose = async () => {
    await stopScanner();
    setScannedText(null);
    setMatchedAsset(null);
    setScanError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#3F72AF] flex items-center justify-center font-bold">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#112D4E]">Quét mã QR Thiết bị</h3>
              <p className="text-xs text-slate-500">Nhận diện thiết bị nhanh qua Camera hoặc File ảnh</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hidden element for file scanning */}
        <div id="qr-scanner-file-hidden" className="hidden"></div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 flex-1">
          {/* Mode Switcher Tabs */}
          {!scannedText && (
            <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setMode('CAMERA');
                  setScanError(null);
                }}
                className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  mode === 'CAMERA'
                    ? 'bg-white text-[#3F72AF] shadow-xs'
                    : 'text-slate-600 hover:text-[#112D4E]'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Camera trực tiếp</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  stopScanner();
                  setMode('FILE');
                  setScanError(null);
                }}
                className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  mode === 'FILE'
                    ? 'bg-white text-[#3F72AF] shadow-xs'
                    : 'text-slate-600 hover:text-[#112D4E]'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Tải ảnh QR từ máy</span>
              </button>
            </div>
          )}

          {/* Error Message */}
          {scanError && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{scanError}</div>
            </div>
          )}

          {/* VIEW: NOT SCANNED YET */}
          {!scannedText ? (
            <div>
              {mode === 'CAMERA' ? (
                <div className="space-y-3 text-center">
                  <div className="relative w-full max-w-xs mx-auto aspect-square bg-slate-900 rounded-2xl overflow-hidden border-2 border-slate-200 flex items-center justify-center shadow-inner">
                    <div id="qr-scanner-viewport" className="w-full h-full"></div>
                    {!isScanning && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-white text-xs gap-2">
                        <Camera className="w-8 h-8 text-sky-400 animate-pulse" />
                        <span>Đang khởi động Camera...</span>
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Hướng camera về phía tem mã QR dán trên máy móc hoặc thiết bị
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 hover:border-[#3F72AF] hover:bg-sky-50/40 rounded-2xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center gap-3 bg-slate-50/50"
                  >
                    <div className="w-12 h-12 rounded-full bg-blue-100 text-[#3F72AF] flex items-center justify-center">
                      <FileSearch className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#112D4E] block">
                        Bấm để chọn file ảnh QR từ máy tính
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Hỗ trợ file ảnh .png, .jpg, .jpeg (như file QR vừa tải ở trang Thiết bị)
                      </span>
                    </div>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              )}
            </div>
          ) : (
            /* VIEW: SCAN SUCCESS RESULT */
            <div className="space-y-4">
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div className="text-xs">
                  <span className="font-bold text-emerald-800 block">Đã quét mã QR thành công!</span>
                  <span className="text-emerald-700 font-mono text-[11px] truncate block max-w-sm">
                    Dữ liệu mã: {scannedText}
                  </span>
                </div>
              </div>

              {matchedAsset ? (
                /* MATCHED ASSET SUMMARY CARD */
                <div className="p-4 bg-white rounded-2xl border-2 border-blue-100 shadow-sm space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-[#3F72AF]">
                          {matchedAsset.asset_code}
                        </span>
                        <span
                          style={{
                            color: ENUMS.ASSET_STATUSES[matchedAsset.status]?.color,
                            backgroundColor: ENUMS.ASSET_STATUSES[matchedAsset.status]?.bg
                          }}
                          className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                        >
                          {ENUMS.ASSET_STATUSES[matchedAsset.status]?.label || matchedAsset.status}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-[#112D4E] mt-1.5">
                        {matchedAsset.name}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {data.locations.find(l => l.id === matchedAsset.location_id)?.name || 'Khu vực xưởng'}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-lg font-extrabold text-[#3F72AF]">
                        {matchedAsset.health_score}%
                      </span>
                      <div className="text-[10px] text-slate-400">Sức khỏe máy</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t text-slate-600">
                    <div>
                      <span className="text-slate-400">Model: </span>
                      <strong>{matchedAsset.details?.model || 'Tiêu chuẩn'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Chỉ số: </span>
                      <strong className="font-mono">{matchedAsset.current_meter} {matchedAsset.meter_unit}</strong>
                    </div>
                  </div>

                  {/* 2 Quick Action Buttons */}
                  <div className="grid grid-cols-2 gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        handleClose();
                        if (onViewAsset) onViewAsset(matchedAsset);
                      }}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-[#112D4E] rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#3F72AF]" />
                      <span>Xem hồ sơ máy</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        handleClose();
                        if (onCreateWoForAsset) onCreateWoForAsset(matchedAsset);
                      }}
                      className="px-3 py-2 bg-[#3F72AF] hover:bg-[#325d91] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span>Tạo phiếu bảo trì</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* UNMATCHED ASSET WARNING */
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-center space-y-2">
                  <p className="text-slate-600">
                    Mã giải mã được là <strong>"{scannedText}"</strong> nhưng không khớp với thiết bị nào trong cơ sở dữ liệu Nhà máy Bắc Ninh.
                  </p>
                </div>
              )}

              {/* Reset to scan another */}
              <div className="flex justify-center pt-2">
                <button
                  type="button"
                  onClick={handleResetScan}
                  className="px-4 py-1.5 text-xs font-semibold text-[#3F72AF] hover:bg-blue-50 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Quét mã khác</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

