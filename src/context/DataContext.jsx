import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_DATA, ENUMS } from '../mockData/initialData';

const DataContext = createContext(null);
const AuthContext = createContext(null);

const STORAGE_KEY = 'risova_cmms_database_v1';
const AUTH_KEY = 'risova_cmms_current_user';
const AUTH_STATUS_KEY = 'risova_cmms_is_authenticated';

export function DataProvider({ children }) {
  // Load data from localStorage or fallback to INITIAL_DATA
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load localStorage data:', e);
    }
    return INITIAL_DATA;
  });

  // Save to localStorage when state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }, [data]);

  // Toast notifications state
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // 1. CREATE WORK ORDER
  const createWorkOrder = (newWo, currentUser) => {
    const count = data.work_orders.length + 1;
    const woCode = `WO-2025-01${count < 10 ? '0' + count : count}`;
    
    // Find asset
    const asset = data.assets.find(a => a.id === Number(newWo.asset_id)) || data.assets[0];

    // Format parts
    const preparedParts = (newWo.parts || []).map((p, idx) => {
      const partInfo = data.spare_parts.find(sp => sp.id === Number(p.part_id));
      return {
        id: Date.now() + idx,
        part_id: Number(p.part_id),
        part_code: partInfo ? partInfo.part_code : 'PART-GEN',
        part_name: partInfo ? partInfo.name : 'Phụ tùng đề xuất',
        quantity_needed: Number(p.quantity_needed || 1),
        quantity_issued: 0,
        quantity_consumed: 0,
        status: 'RESERVED'
      };
    });

    const workOrder = {
      id: Date.now(),
      wo_code: woCode,
      asset_id: asset.id,
      asset_code: asset.asset_code,
      asset_name: asset.name,
      schedule_id: newWo.schedule_id ? Number(newWo.schedule_id) : null,
      title: newWo.title,
      description: newWo.description || '',
      wo_type: newWo.wo_type || 'REPAIR',
      priority: newWo.priority || 'MEDIUM',
      status: 'OPEN',
      failure_code_id: newWo.failure_code_id ? Number(newWo.failure_code_id) : null,
      root_cause: newWo.root_cause || '',
      resolution_notes: '',
      hold_reason: null,
      cancel_reason: null,
      reported_by: currentUser ? currentUser.id : 1,
      assigned_to: newWo.assigned_to ? Number(newWo.assigned_to) : null,
      verified_by: 1,
      scheduled_start: newWo.scheduled_start || new Date().toISOString(),
      scheduled_end: newWo.scheduled_end || new Date(Date.now() + 86400000 * 2).toISOString(),
      actual_start: null,
      actual_end: null,
      labor_hours: Number(newWo.labor_hours || 2.5),
      estimated_cost: Number(newWo.estimated_cost || 1500000),
      actual_cost: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      closed_at: null,
      due_date: newWo.due_date || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      checklists: newWo.checklists && newWo.checklists.length > 0 
        ? newWo.checklists 
        : [
            { id: 1, step_number: 1, task_description: 'Kiểm tra hiện trường & áp dụng quy trình an toàn điện/cơ', is_completed: false, note: '' },
            { id: 2, step_number: 2, task_description: 'Thực hiện thao tác sửa chữa/thay thế theo quy trình kỹ thuật', is_completed: false, note: '' },
            { id: 3, step_number: 3, task_description: 'Vận hành thử nghiệm và kiểm tra thông số kỹ thuật', is_completed: false, note: '' },
            { id: 4, step_number: 4, task_description: 'Vệ sinh hiện trường và bàn giao thiết bị', is_completed: false, note: '' }
          ],
      parts: preparedParts
    };

    // Update spare_parts reserved quantity
    const updatedSpareParts = data.spare_parts.map(part => {
      const match = preparedParts.find(p => p.part_id === part.id);
      if (match) {
        return {
          ...part,
          reserved_quantity: (part.reserved_quantity || 0) + match.quantity_needed
        };
      }
      return part;
    });

    // Update asset status to MAINTENANCE if critical/emergency
    const updatedAssets = data.assets.map(a => {
      if (a.id === asset.id && (newWo.priority === 'CRITICAL' || newWo.wo_type === 'EMERGENCY')) {
        return { ...a, status: 'MAINTENANCE' };
      }
      return a;
    });

    // Audit log
    const audit = {
      id: Date.now(),
      user_id: currentUser ? currentUser.id : 1,
      user_name: currentUser ? currentUser.full_name : 'Quản lý',
      action: 'CREATE_WORK_ORDER',
      entity_type: 'WORK_ORDER',
      entity_id: woCode,
      old_value: null,
      new_value: { priority: workOrder.priority, type: workOrder.wo_type, asset: workOrder.asset_code },
      ip_address: '192.168.1.15',
      created_at: new Date().toISOString()
    };

    // Activity
    const activity = {
      id: Date.now(),
      type: 'WO_CREATE',
      user: currentUser ? currentUser.full_name : 'Quản trị viên',
      title: `${currentUser ? currentUser.full_name : 'Người dùng'} tạo lệnh việc ${woCode}`,
      detail: workOrder.title,
      time_ago: 'Vừa xong',
      timestamp: new Date().toISOString()
    };

    setData(prev => ({
      ...prev,
      work_orders: [workOrder, ...prev.work_orders],
      spare_parts: updatedSpareParts,
      assets: updatedAssets,
      audit_logs: [audit, ...prev.audit_logs],
      activities: [activity, ...prev.activities]
    }));

    addToast(`Đã tạo thành công lệnh làm việc ${woCode}!`, 'success');
    return workOrder;
  };

  // 2. UPDATE WORK ORDER STATUS
  const updateWorkOrderStatus = (woId, newStatus, currentUser, note = '') => {
    setData(prev => {
      const wo = prev.work_orders.find(w => w.id === woId);
      if (!wo) return prev;

      let extra = {};
      if (newStatus === 'IN_PROGRESS' && !wo.actual_start) {
        extra.actual_start = new Date().toISOString();
      }
      if (newStatus === 'COMPLETED' || newStatus === 'CLOSED') {
        extra.actual_end = new Date().toISOString();
        extra.closed_at = new Date().toISOString();
      }

      // If CANCELLED, release reserved parts
      let updatedSpareParts = [...prev.spare_parts];
      let updatedParts = [...(wo.parts || [])];

      if (newStatus === 'CANCELLED') {
        updatedParts = updatedParts.map(p => {
          if (p.status === 'RESERVED') {
            const spIdx = updatedSpareParts.findIndex(sp => sp.id === p.part_id);
            if (spIdx !== -1) {
              updatedSpareParts[spIdx] = {
                ...updatedSpareParts[spIdx],
                reserved_quantity: Math.max(0, updatedSpareParts[spIdx].reserved_quantity - p.quantity_needed)
              };
            }
            return { ...p, status: 'RELEASED' };
          }
          return p;
        });
      }

      const updatedWo = {
        ...wo,
        status: newStatus,
        ...extra,
        resolution_notes: note ? (wo.resolution_notes ? wo.resolution_notes + '\n' + note : note) : wo.resolution_notes,
        parts: updatedParts,
        updated_at: new Date().toISOString()
      };

      const updatedOrders = prev.work_orders.map(w => w.id === woId ? updatedWo : w);

      // Audit log
      const audit = {
        id: Date.now(),
        user_id: currentUser ? currentUser.id : 1,
        user_name: currentUser ? currentUser.full_name : 'Người dùng',
        action: 'UPDATE_STATUS',
        entity_type: 'WORK_ORDER',
        entity_id: wo.wo_code,
        old_value: { status: wo.status },
        new_value: { status: newStatus },
        ip_address: '192.168.1.50',
        created_at: new Date().toISOString()
      };

      // Activity
      const activity = {
        id: Date.now(),
        type: newStatus === 'COMPLETED' ? 'WO_COMPLETE' : 'WO_UPDATE',
        user: currentUser ? currentUser.full_name : 'Kỹ thuật viên',
        title: `${currentUser ? currentUser.full_name : 'Kỹ thuật viên'} cập nhật ${wo.wo_code} sang ${ENUMS.WO_STATUSES[newStatus]?.label || newStatus}`,
        detail: note || `Trạng thái: ${ENUMS.WO_STATUSES[newStatus]?.label}`,
        time_ago: 'Vừa xong',
        timestamp: new Date().toISOString()
      };

      return {
        ...prev,
        work_orders: updatedOrders,
        spare_parts: updatedSpareParts,
        audit_logs: [audit, ...prev.audit_logs],
        activities: [activity, ...prev.activities]
      };
    });

    addToast(`Cập nhật trạng thái lệnh việc sang ${ENUMS.WO_STATUSES[newStatus]?.label || newStatus}!`, 'info');
  };

  // 3. TOGGLE CHECKLIST ITEM
  const toggleChecklist = (woId, stepId, note = '', currentUser) => {
    setData(prev => {
      const updatedOrders = prev.work_orders.map(wo => {
        if (wo.id !== woId) return wo;
        const updatedChecklists = (wo.checklists || []).map(item => {
          if (item.id === stepId) {
            const nextCompleted = !item.is_completed;
            return {
              ...item,
              is_completed: nextCompleted,
              completed_by: nextCompleted ? (currentUser ? currentUser.id : 2) : null,
              completed_at: nextCompleted ? new Date().toISOString() : null,
              note: note || item.note
            };
          }
          return item;
        });

        // Auto move to IN_PROGRESS if first step completed and was OPEN/ASSIGNED
        let status = wo.status;
        if ((status === 'OPEN' || status === 'ASSIGNED') && updatedChecklists.some(c => c.is_completed)) {
          status = 'IN_PROGRESS';
        }

        return {
          ...wo,
          status,
          checklists: updatedChecklists,
          updated_at: new Date().toISOString()
        };
      });

      return { ...prev, work_orders: updatedOrders };
    });
  };

  // 4. ISSUE SPARE PART FOR WORK ORDER
  const issuePartForWorkOrder = (woId, partId, quantity, currentUser) => {
    setData(prev => {
      const wo = prev.work_orders.find(w => w.id === woId);
      const part = prev.spare_parts.find(p => p.id === partId);
      if (!wo || !part) return prev;

      const qty = Number(quantity || 1);
      if (part.quantity_in_stock < qty) {
        addToast(`Không đủ số lượng trong kho! Tồn kho hiện có: ${part.quantity_in_stock}`, 'danger');
        return prev;
      }

      // Update part in work order
      const updatedWoParts = (wo.parts || []).map(p => {
        if (p.part_id === partId) {
          return {
            ...p,
            quantity_issued: (p.quantity_issued || 0) + qty,
            status: 'ISSUED'
          };
        }
        return p;
      });

      // Update spare parts stock
      const updatedSpareParts = prev.spare_parts.map(p => {
        if (p.id === partId) {
          const newStock = Math.max(0, p.quantity_in_stock - qty);
          const newReserved = Math.max(0, (p.reserved_quantity || 0) - qty);
          return {
            ...p,
            quantity_in_stock: newStock,
            reserved_quantity: newReserved,
            is_low_stock: newStock <= p.min_stock_level
          };
        }
        return p;
      });

      // Transaction log
      const txn = {
        id: Date.now(),
        part_id: part.id,
        part_code: part.part_code,
        part_name: part.name,
        work_order_id: wo.id,
        wo_code: wo.wo_code,
        transaction_type: 'ISSUE',
        quantity: qty,
        performed_by: currentUser ? currentUser.id : 3,
        performed_by_name: currentUser ? currentUser.full_name : 'Thủ kho',
        note: `Xuất kho ${qty} ${part.unit} cho ${wo.wo_code}`,
        created_at: new Date().toISOString()
      };

      // Activity
      const activity = {
        id: Date.now(),
        type: 'INV_ISSUE',
        user: currentUser ? currentUser.full_name : 'Phạm Gia Huy',
        title: `${currentUser ? currentUser.full_name : 'Thủ kho'} xuất ${qty} ${part.unit} ${part.name}`,
        detail: `Cấp phát cho lệnh làm việc ${wo.wo_code}`,
        time_ago: 'Vừa xong',
        timestamp: new Date().toISOString()
      };

      const updatedOrders = prev.work_orders.map(w => w.id === woId ? { ...w, parts: updatedWoParts } : w);

      return {
        ...prev,
        work_orders: updatedOrders,
        spare_parts: updatedSpareParts,
        inventory_transactions: [txn, ...prev.inventory_transactions],
        activities: [activity, ...prev.activities]
      };
    });

    addToast(`Đã xuất kho phụ tùng cho lệnh việc!`, 'success');
  };

  // 5. CONSUME PART
  const consumePartForWorkOrder = (woId, partId) => {
    setData(prev => {
      const updatedOrders = prev.work_orders.map(wo => {
        if (wo.id !== woId) return wo;
        const updatedParts = (wo.parts || []).map(p => {
          if (p.part_id === partId) {
            return {
              ...p,
              quantity_consumed: p.quantity_issued || p.quantity_needed,
              status: 'CONSUMED'
            };
          }
          return p;
        });
        return { ...wo, parts: updatedParts };
      });
      return { ...prev, work_orders: updatedOrders };
    });
    addToast('Đã xác nhận phụ tùng đã lắp đặt hoàn tất!', 'success');
  };

  // 6. IOT SENSOR SIMULATION & ALERT TRIGGER (ĐÃ SỬA: TÍNH ĐIỂM DYNAMIC & KHÔNG TRÙNG LẶP ALERT)
  const simulateIoTMeasurement = (assetId, metricType, value, unit) => {
    const numVal = Number(value);
    const asset = data.assets.find(a => a.id === assetId);
    if (!asset) return;

    // Find threshold
    const threshold = data.asset_thresholds.find(t => t.asset_id === assetId && t.metric_type === metricType) || {
      id: 1,
      warning_limit: 90,
      danger_limit: 100
    };

    let level = null;
    let targetHealthScore = 92;

    if (numVal >= threshold.danger_limit) {
      level = 'DANGER';
      // Điểm sức khỏe nguy hiểm: 25 - 35
      const overflowRatio = Math.min(1, Math.max(0, (numVal - threshold.danger_limit) / 15));
      targetHealthScore = Math.round(35 - overflowRatio * 10);
    } else if (numVal >= threshold.warning_limit) {
      level = 'WARNING';
      // Điểm sức khỏe cảnh báo: 60 - 70
      const range = (threshold.danger_limit - threshold.warning_limit) || 1;
      const progress = Math.min(1, Math.max(0, (numVal - threshold.warning_limit) / range));
      targetHealthScore = Math.round(70 - progress * 10);
    } else {
      // An toàn: 85 - 95
      const normalRange = threshold.warning_limit || 50;
      const progress = Math.min(1, Math.max(0, numVal / normalRange));
      targetHealthScore = Math.round(95 - progress * 10);
    }

    const logEntry = {
      id: Date.now(),
      asset_id: assetId,
      metric_type: metricType,
      unit: unit,
      value: numVal,
      source: 'IOT_SENSOR',
      recorded_by: null,
      recorded_at: new Date().toISOString()
    };

    let shouldShowToast = false;
    let toastType = 'info';
    let toastMsg = '';

    setData(prev => {
      const nextLogs = [logEntry, ...(prev.telemetry_logs || []).slice(0, 49)];
      let nextAlerts = [...prev.alerts];

      const alertTitle = metricType === 'TEMPERATURE' ? 'Nhiệt độ dầu nén' : metricType === 'VIBRATION' ? 'Độ rung động cơ' : 'Cảnh báo cảm biến';
      const alertDesc = `${asset.name} (${asset.asset_code}) | ${numVal.toFixed(1)}${unit} - Ngưỡng > ${threshold.dangerLimit || threshold.danger_limit}${unit}`;

      if (level) {
        // Tìm cảnh báo đang mở (OPEN / ACKNOWLEDGED) của thiết bị này
        const existingIdx = nextAlerts.findIndex(
          a => a.asset_id === assetId && a.status !== 'RESOLVED'
        );

        if (existingIdx !== -1) {
          // ĐÃ CÓ CẢNH BÁO -> CẬP NHẬT GIÁ TRỊ, KHÔNG TẠO DÒNG TRÙNG LẶP
          const oldAlert = nextAlerts[existingIdx];
          const levelChanged = oldAlert.level !== level;

          nextAlerts[existingIdx] = {
            ...oldAlert,
            level: level,
            trigger_value: numVal,
            description: alertDesc,
            triggered_at: new Date().toISOString()
          };

          if (levelChanged) {
            shouldShowToast = true;
            toastType = level === 'DANGER' ? 'danger' : 'warning';
            toastMsg = level === 'DANGER'
              ? `🚨 NGUY HIỂM: ${asset.asset_code} đạt ${numVal.toFixed(1)}${unit} vượt ngưỡng đỏ > ${threshold.danger_limit}${unit}!`
              : `⚠️ CẢNH BÁO: ${asset.asset_code} đạt ${numVal.toFixed(1)}${unit} vượt ngưỡng vàng > ${threshold.warning_limit}${unit}!`;
          }
        } else {
          // CHƯA CÓ CẢNH BÁO NÀO -> TẠO MỚI 1 DÒNG CẢNH BÁO
          const newAlert = {
            id: Date.now(),
            asset_id: assetId,
            threshold_id: threshold.id || 1,
            level: level,
            status: 'OPEN',
            trigger_value: numVal,
            threshold_val: level === 'DANGER' ? threshold.danger_limit : threshold.warning_limit,
            title: alertTitle,
            description: alertDesc,
            triggered_at: new Date().toISOString(),
            acknowledged_by: null,
            acknowledged_at: null,
            resolved_at: null,
            work_order_id: null
          };
          nextAlerts = [newAlert, ...nextAlerts];
          shouldShowToast = true;
          toastType = level === 'DANGER' ? 'danger' : 'warning';
          toastMsg = level === 'DANGER'
            ? `🚨 NGUY HIỂM: Cảm biến ${asset.asset_code} đo được ${numVal.toFixed(1)}${unit} vượt ngưỡng an toàn!`
            : `⚠️ CẢNH BÁO: Chỉ số ${asset.asset_code} đạt ${numVal.toFixed(1)}${unit} tiệm cận ngưỡng giới hạn!`;
        }
      }

      // CẬP NHẬT ĐIỂM SỨC KHỎE THIẾT BỊ TRỰC TIẾP
      const updatedAssets = prev.assets.map(a => {
        if (a.id === assetId) {
          return { ...a, health_score: targetHealthScore };
        }
        return a;
      });

      // Hoạt động mới khi có cảnh báo
      let nextActivities = prev.activities;
      if (level === 'DANGER' && shouldShowToast) {
        const iotActivity = {
          id: Date.now(),
          type: 'IOT_ALERT',
          user: 'Hệ thống IoT',
          title: `Hệ thống ghi nhận cảnh báo nguy hiểm tại ${asset.asset_code}`,
          detail: `Giá trị cảm biến ${numVal.toFixed(1)}${unit} vượt ngưỡng an toàn ${threshold.danger_limit}${unit}`,
          time_ago: 'Vừa xong',
          timestamp: new Date().toISOString()
        };
        nextActivities = [iotActivity, ...prev.activities.slice(0, 19)];
      }

      return {
        ...prev,
        telemetry_logs: nextLogs,
        alerts: nextAlerts,
        assets: updatedAssets,
        activities: nextActivities
      };
    });

    if (shouldShowToast && toastMsg) {
      addToast(toastMsg, toastType);
    }
  };

  // 7. ACKNOWLEDGE & RESOLVE ALERT
  const acknowledgeAlert = (alertId, currentUser) => {
    setData(prev => ({
      ...prev,
      alerts: prev.alerts.map(a => a.id === alertId ? {
        ...a,
        status: 'ACKNOWLEDGED',
        acknowledged_by: currentUser ? currentUser.id : 1,
        acknowledged_at: new Date().toISOString()
      } : a)
    }));
    addToast('Đã tiếp nhận cảnh báo kỹ thuật!', 'info');
  };

  const resolveAlert = (alertId) => {
    setData(prev => ({
      ...prev,
      alerts: prev.alerts.map(a => a.id === alertId ? {
        ...a,
        status: 'RESOLVED',
        resolved_at: new Date().toISOString()
      } : a)
    }));
    addToast('Đã xử lý & hoàn tất giải quyết cảnh báo!', 'success');
  };

  // 8. ASSET CRUD
  const createAsset = (assetData) => {
    const newId = Date.now();
    const asset = {
      id: newId,
      asset_code: assetData.asset_code || `EQ-${Math.floor(1000 + Math.random() * 9000)}`,
      name: assetData.name,
      location_id: Number(assetData.location_id || 1),
      parent_asset_id: assetData.parent_asset_id ? Number(assetData.parent_asset_id) : null,
      priority: assetData.priority || 'MEDIUM',
      required_specialty_id: Number(assetData.required_specialty_id || 1),
      status: assetData.status || 'ACTIVE',
      current_meter: Number(assetData.current_meter || 0),
      meter_unit: assetData.meter_unit || 'HOURS',
      health_score: 95,
      qr_code_url: `https://risova.vn/qr/${assetData.asset_code}`,
      installed_date: assetData.installed_date || new Date().toISOString().split('T')[0],
      warranty_expiry: assetData.warranty_expiry || '2027-01-01',
      details: {
        manufacturer: assetData.manufacturer || 'OEM',
        model: assetData.model || 'Standard',
        serial_number: assetData.serial_number || `SN-${Date.now().toString().slice(-6)}`,
        description: assetData.description || '',
        purchase_price: Number(assetData.purchase_price || 50000000),
        purchase_date: assetData.purchase_date || new Date().toISOString().split('T')[0]
      }
    };

    setData(prev => ({
      ...prev,
      assets: [asset, ...prev.assets]
    }));
    addToast(`Đã thêm thiết bị mới ${asset.name} (${asset.asset_code})!`, 'success');
    return asset;
  };

  const updateAsset = (id, updates) => {
    setData(prev => ({
      ...prev,
      assets: prev.assets.map(a => a.id === id ? { ...a, ...updates, details: { ...(a.details || {}), ...(updates.details || {}) } } : a)
    }));
    addToast('Đã cập nhật thông tin thiết bị!', 'success');
  };

  // 9. LOCATION CRUD
  const createLocation = (loc) => {
    const newLoc = {
      id: Date.now(),
      code: loc.code,
      name: loc.name,
      location_type: loc.location_type || 'ZONE',
      parent_id: loc.parent_id ? Number(loc.parent_id) : null,
      description: loc.description || '',
      is_active: true
    };
    setData(prev => ({
      ...prev,
      locations: [...prev.locations, newLoc]
    }));
    addToast(`Đã thêm địa điểm ${loc.name}!`, 'success');
  };

  // 10. SPARE PART CRUD & STOCK ADJUSTMENT
  const createSparePart = (part) => {
    const newPart = {
      id: Date.now(),
      part_code: part.part_code,
      name: part.name,
      unit: part.unit || 'Cái',
      quantity_in_stock: Number(part.quantity_in_stock || 0),
      reserved_quantity: 0,
      min_stock_level: Number(part.min_stock_level || 5),
      unit_price: Number(part.unit_price || 100000),
      category: part.category || 'Phụ tùng tổng hợp',
      is_low_stock: Number(part.quantity_in_stock || 0) <= Number(part.min_stock_level || 5)
    };
    setData(prev => ({
      ...prev,
      spare_parts: [newPart, ...prev.spare_parts]
    }));
    addToast(`Đã thêm phụ tùng ${newPart.name} vào danh mục kho!`, 'success');
  };

  const adjustStock = (partId, deltaQty, reason, type = 'RECEIPT', currentUser) => {
    const qty = Number(deltaQty);
    setData(prev => {
      const part = prev.spare_parts.find(p => p.id === partId);
      if (!part) return prev;

      const newStock = Math.max(0, part.quantity_in_stock + (type === 'ISSUE' ? -qty : qty));
      const updatedSpareParts = prev.spare_parts.map(p => {
        if (p.id === partId) {
          return {
            ...p,
            quantity_in_stock: newStock,
            is_low_stock: newStock <= p.min_stock_level
          };
        }
        return p;
      });

      const txn = {
        id: Date.now(),
        part_id: part.id,
        part_code: part.part_code,
        part_name: part.name,
        work_order_id: null,
        wo_code: null,
        transaction_type: type,
        quantity: Math.abs(qty),
        performed_by: currentUser ? currentUser.id : 3,
        performed_by_name: currentUser ? currentUser.full_name : 'Thủ kho',
        note: reason || `Thao tác ${ENUMS.INVENTORY_TXN_TYPES[type]?.label}`,
        created_at: new Date().toISOString()
      };

      return {
        ...prev,
        spare_parts: updatedSpareParts,
        inventory_transactions: [txn, ...prev.inventory_transactions]
      };
    });
    addToast(`Đã cập nhật kho thành công: ${qty > 0 ? '+' : ''}${qty}!`, 'success');
  };

  // 11. MAINTENANCE SCHEDULE CRUD
  const createMaintenanceSchedule = (schedule) => {
    const asset = data.assets.find(a => a.id === Number(schedule.asset_id)) || data.assets[0];
    const newSched = {
      id: Date.now(),
      asset_id: asset.id,
      asset_code: asset.asset_code,
      title: schedule.title,
      schedule_type: schedule.schedule_type || 'TIME_BASED',
      assigned_specialty_id: Number(schedule.assigned_specialty_id || 1),
      frequency_days: Number(schedule.frequency_days || 30),
      last_completed_date: null,
      next_due_date: schedule.next_due_date || new Date(Date.now() + 86400000 * 14).toISOString(),
      generate_lead_days: 7,
      meter_interval: schedule.meter_interval ? Number(schedule.meter_interval) : null,
      last_pm_meter: null,
      next_due_meter: schedule.next_due_meter ? Number(schedule.next_due_meter) : null,
      generate_lead_meter: 100,
      estimated_duration_hours: Number(schedule.estimated_duration_hours || 2.0),
      status_label: 'Sắp tới',
      badge_color: 'success',
      display_date: schedule.display_date || 'Hàng tháng',
      is_active: true
    };
    setData(prev => ({
      ...prev,
      maintenance_schedules: [newSched, ...prev.maintenance_schedules]
    }));
    addToast(`Đã lập kế hoạch bảo dưỡng định kỳ mới: ${newSched.title}!`, 'success');
  };

  // Reset to initial
  const resetToDefault = () => {
    localStorage.removeItem(STORAGE_KEY);
    setData(INITIAL_DATA);
    addToast('Đã khôi phục dữ liệu gốc mẫu của Nhà máy Bắc Ninh!', 'info');
  };

  return (
    <DataContext.Provider value={{
      data,
      ENUMS,
      toasts,
      addToast,
      removeToast,
      createWorkOrder,
      updateWorkOrderStatus,
      toggleChecklist,
      issuePartForWorkOrder,
      consumePartForWorkOrder,
      simulateIoTMeasurement,
      acknowledgeAlert,
      resolveAlert,
      createAsset,
      updateAsset,
      createLocation,
      createSparePart,
      adjustStock,
      createMaintenanceSchedule,
      resetToDefault
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
}

export function AuthProvider({ children }) {
  // Current user: default to Minh Anh (MANAGER)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem(AUTH_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_DATA.users[0]; // Minh Anh - MANAGER
  });

  // Lưu trạng thái đăng nhập vào localStorage (mặc định lần đầu là false để hiển thị AuthPage chuẩn Figma)
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      const saved = localStorage.getItem(AUTH_STATUS_KEY);
      if (saved !== null) {
        return saved === 'true';
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  });

  const loginAsRole = (roleCode) => {
    const user = INITIAL_DATA.users.find(u => u.role === roleCode) || INITIAL_DATA.users[0];
    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    localStorage.setItem(AUTH_STATUS_KEY, 'true');
  };

  const loginWithCredentials = (email, password) => {
    const user = INITIAL_DATA.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || INITIAL_DATA.users[0];
    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    localStorage.setItem(AUTH_STATUS_KEY, 'true');
    return true;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.setItem(AUTH_STATUS_KEY, 'false');
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      isAuthenticated,
      loginAsRole,
      loginWithCredentials,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
