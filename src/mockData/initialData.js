/**
 * Risova Enterprise CMMS - Chuẩn hóa Mock Data 100% bám sát Database Schema (Risova (2).pdf)
 * Nhà máy: Nhà máy Sản xuất Risova Bắc Ninh
 */

export const ENUMS = {
  USER_ROLES: {
    MANAGER: { code: 'MANAGER', label: 'Quản lý bảo trì', desc: 'Toàn quyền điều hành, phân công, duyệt chi phí & vật tư' },
    TECHNICIAN: { code: 'TECHNICIAN', label: 'Kỹ thuật viên', desc: 'Thực hiện lệnh việc, cập nhật checklist, báo sự cố' },
    STAFF: { code: 'STAFF', label: 'Nhân viên vận hành', desc: 'Vận hành máy, nhập nhật ký và báo cáo hỏng hóc' },
    INVENTORY_STAFF: { code: 'INVENTORY_STAFF', label: 'Thủ kho vật tư', desc: 'Quản lý nhập xuất, cấp phát và tồn kho phụ tùng' }
  },

  LOCATION_TYPES: {
    PLANT: { code: 'PLANT', label: 'Nhà máy', desc: 'Cơ sở sản xuất cấp cao nhất' },
    ZONE: { code: 'ZONE', label: 'Phân xưởng', desc: 'Khu vực / Phân xưởng sản xuất' },
    LINE: { code: 'LINE', label: 'Dây chuyền', desc: 'Dây chuyền sản xuất cụ thể' }
  },

  ASSET_STATUSES: {
    ACTIVE: { code: 'ACTIVE', label: 'Đang hoạt động', color: '#10B981', bg: '#DCFCE7' },
    MAINTENANCE: { code: 'MAINTENANCE', label: 'Đang bảo trì', color: '#F59E0B', bg: '#FEF3C7' },
    BROKEN: { code: 'BROKEN', label: 'Đang hỏng hóc', color: '#EF4444', bg: '#FEE2E2' },
    RETIRED: { code: 'RETIRED', label: 'Đã thanh lý', color: '#64748B', bg: '#F1F5F9' }
  },

  WO_TYPES: {
    PREVENTIVE: { code: 'PREVENTIVE', label: 'Bảo trì định kỳ (PM)', color: '#3F72AF', bg: '#DBE2EF' },
    REPAIR: { code: 'REPAIR', label: 'Sửa chữa phục hồi', color: '#F59E0B', bg: '#FEF3C7' },
    EMERGENCY: { code: 'EMERGENCY', label: 'Sự cố khẩn cấp (EM)', color: '#EF4444', bg: '#FEE2E2' }
  },

  WO_STATUSES: {
    OPEN: { code: 'OPEN', label: 'Mới mở', color: '#64748B', bg: '#F1F5F9' },
    ASSIGNED: { code: 'ASSIGNED', label: 'Đã giao', color: '#3F72AF', bg: '#DBE2EF' },
    IN_PROGRESS: { code: 'IN_PROGRESS', label: 'Đang thực hiện', color: '#F59E0B', bg: '#FEF3C7' },
    ON_HOLD: { code: 'ON_HOLD', label: 'Tạm dừng', color: '#9333EA', bg: '#F3E8FF' },
    COMPLETED: { code: 'COMPLETED', label: 'Đã hoàn thành', color: '#10B981', bg: '#DCFCE7' },
    CLOSED: { code: 'CLOSED', label: 'Đã đóng / Nghiệm thu', color: '#047857', bg: '#D1FAE5' },
    CANCELLED: { code: 'CANCELLED', label: 'Đã hủy', color: '#94A3B8', bg: '#F8FAFC' }
  },

  PRIORITIES: {
    LOW: { code: 'LOW', label: 'Thấp', color: '#64748B', bg: '#F1F5F9' },
    MEDIUM: { code: 'MEDIUM', label: 'Trung bình', color: '#10B981', bg: '#DCFCE7' },
    HIGH: { code: 'HIGH', label: 'Cao', color: '#F59E0B', bg: '#FEF3C7' },
    CRITICAL: { code: 'CRITICAL', label: 'Khẩn cấp', color: '#EF4444', bg: '#FEE2E2' }
  },

  SCHEDULE_TYPES: {
    TIME_BASED: { code: 'TIME_BASED', label: 'Theo thời gian định kỳ' },
    METER_BASED: { code: 'METER_BASED', label: 'Theo chỉ số đồng hồ (Giờ/Km/Chu kỳ)' },
    HYBRID: { code: 'HYBRID', label: 'Kết hợp (Điều kiện nào đến trước)' }
  },

  TELEMETRY_SOURCES: {
    IOT_SENSOR: { code: 'IOT_SENSOR', label: 'Cảm biến IoT tự động' },
    MANUAL: { code: 'MANUAL', label: 'Nhập tay định kỳ' }
  },

  ALERT_LEVELS: {
    WARNING: { code: 'WARNING', label: 'Cảnh báo', color: '#F59E0B', bg: '#FEF3C7' },
    DANGER: { code: 'DANGER', label: 'Nguy hiểm', color: '#EF4444', bg: '#FEE2E2' }
  },

  ALERT_STATUSES: {
    OPEN: { code: 'OPEN', label: 'Chưa xử lý', color: '#EF4444' },
    ACKNOWLEDGED: { code: 'ACKNOWLEDGED', label: 'Đã tiếp nhận', color: '#F59E0B' },
    RESOLVED: { code: 'RESOLVED', label: 'Đã giải quyết', color: '#10B981' }
  },

  WO_PART_STATUSES: {
    RESERVED: { code: 'RESERVED', label: 'Đã giữ chỗ', color: '#3B82F6', bg: '#EFF6FF' },
    ISSUED: { code: 'ISSUED', label: 'Đã xuất kho', color: '#F59E0B', bg: '#FEF3C7' },
    CONSUMED: { code: 'CONSUMED', label: 'Đã sử dụng', color: '#10B981', bg: '#DCFCE7' },
    RELEASED: { code: 'RELEASED', label: 'Đã giải phóng kho (Hủy giữ chỗ)', color: '#64748B', bg: '#F1F5F9' }
  },

  INVENTORY_TXN_TYPES: {
    RECEIPT: { code: 'RECEIPT', label: 'Nhập kho', color: '#10B981' },
    ISSUE: { code: 'ISSUE', label: 'Xuất kho cho lệnh việc', color: '#EF4444' },
    RETURN: { code: 'RETURN', label: 'Trả lại kho', color: '#3F72AF' },
    ADJUSTMENT: { code: 'ADJUSTMENT', label: 'Điều chỉnh kiểm kê', color: '#F59E0B' }
  }
};

export const INITIAL_DATA = {
  // 1. Chuyên môn kỹ thuật (specialties)
  specialties: [
    { id: 1, name: 'Cơ khí - Thủy lực & Khí nén', is_active: true, created_at: '2025-01-01T08:00:00Z', updated_at: '2025-01-01T08:00:00Z' },
    { id: 2, name: 'Điện công nghiệp - Tự động hóa PLC', is_active: true, created_at: '2025-01-01T08:00:00Z', updated_at: '2025-01-01T08:00:00Z' },
    { id: 3, name: 'Điện lạnh - HVAC & Năng lượng', is_active: true, created_at: '2025-01-01T08:00:00Z', updated_at: '2025-01-01T08:00:00Z' },
    { id: 4, name: 'Robot công nghiệp & Đo lường IoT', is_active: true, created_at: '2025-01-01T08:00:00Z', updated_at: '2025-01-01T08:00:00Z' }
  ],

  // 2. Người dùng hệ thống (users)
  users: [
    {
      id: 1,
      employee_code: 'NV-001',
      full_name: 'Minh Anh',
      email: 'minhanh.manager@risova.vn',
      phone: '0912 345 678',
      role: 'MANAGER',
      is_available: true,
      must_change_password: false,
      failed_login_attempts: 0,
      is_active: true,
      avatar_initials: 'MA',
      created_at: '2025-01-01T08:00:00Z',
      last_login_at: '2025-06-18T10:45:00Z'
    },
    {
      id: 2,
      employee_code: 'KT-102',
      full_name: 'Lê Thu Hà',
      email: 'thuha.tech@risova.vn',
      phone: '0983 112 233',
      role: 'TECHNICIAN',
      is_available: true,
      must_change_password: false,
      failed_login_attempts: 0,
      is_active: true,
      avatar_initials: 'TH',
      created_at: '2025-01-15T08:00:00Z',
      last_login_at: '2025-06-18T10:10:00Z'
    },
    {
      id: 3,
      employee_code: 'TK-205',
      full_name: 'Phạm Gia Huy',
      email: 'giahuy.inv@risova.vn',
      phone: '0977 445 566',
      role: 'INVENTORY_STAFF',
      is_available: true,
      must_change_password: false,
      failed_login_attempts: 0,
      is_active: true,
      avatar_initials: 'GH',
      created_at: '2025-02-01T08:00:00Z',
      last_login_at: '2025-06-18T08:45:00Z'
    },
    {
      id: 4,
      employee_code: 'KT-108',
      full_name: 'Trần Văn Tuấn',
      email: 'vantuan.tech@risova.vn',
      phone: '0905 789 012',
      role: 'TECHNICIAN',
      is_available: false,
      must_change_password: false,
      failed_login_attempts: 0,
      is_active: true,
      avatar_initials: 'VT',
      created_at: '2025-02-10T08:00:00Z',
      last_login_at: '2025-06-18T07:30:00Z'
    },
    {
      id: 5,
      employee_code: 'VH-301',
      full_name: 'Nguyễn Hoàng Nam',
      email: 'hoangnam.staff@risova.vn',
      phone: '0933 654 321',
      role: 'STAFF',
      is_available: true,
      must_change_password: false,
      failed_login_attempts: 0,
      is_active: true,
      avatar_initials: 'HN',
      created_at: '2025-03-01T08:00:00Z',
      last_login_at: '2025-06-18T09:20:00Z'
    }
  ],

  // 3. Phân ca làm việc (work_shifts)
  work_shifts: [
    { id: 1, name: 'Ca 1 (Sáng)', start_time: '06:00:00', end_time: '14:00:00' },
    { id: 2, name: 'Ca 2 (Chiều)', start_time: '14:00:00', end_time: '22:00:00' },
    { id: 3, name: 'Ca 3 (Đêm)', start_time: '22:00:00', end_time: '06:00:00' }
  ],

  // 4. Địa điểm phân cấp (locations): PLANT -> ZONE -> LINE
  locations: [
    {
      id: 1,
      code: 'PLANT-BN',
      name: 'Nhà máy Sản xuất Bắc Ninh',
      location_type: 'PLANT',
      parent_id: null,
      description: 'Tổng diện tích 45,000m², KCN Quế Võ, Bắc Ninh',
      is_active: true
    },
    {
      id: 2,
      code: 'ZONE-A',
      name: 'Phân xưởng Gia công Cơ khí & CNC',
      location_type: 'ZONE',
      parent_id: 1,
      description: 'Khu vực máy phay, tiện CNC, hàn cấu kiện',
      is_active: true
    },
    {
      id: 3,
      code: 'ZONE-B',
      name: 'Phân xưởng Đúc & Ép nhựa Phụ tùng',
      location_type: 'ZONE',
      parent_id: 1,
      description: 'Cụm máy ép thủy lực và máy đúc áp lực cao',
      is_active: true
    },
    {
      id: 4,
      code: 'ZONE-C',
      name: 'Phân xưởng Lắp ráp & Đóng gói Tự động',
      location_type: 'ZONE',
      parent_id: 1,
      description: 'Dây chuyền robot và đóng gói thành phẩm',
      is_active: true
    },
    {
      id: 5,
      code: 'ZONE-UTIL',
      name: 'Trạm Kỹ thuật Trung tâm (Utility)',
      location_type: 'ZONE',
      parent_id: 1,
      description: 'Trạm máy nén khí, trạm biến áp phân phối, tháp giải nhiệt',
      is_active: true
    },
    {
      id: 6,
      code: 'LINE-01',
      name: 'Dây chuyền Đóng gói Tự động 01',
      location_type: 'LINE',
      parent_id: 4,
      description: 'Công suất 3,200 sản phẩm/giờ',
      is_active: true
    },
    {
      id: 7,
      code: 'LINE-02',
      name: 'Dây chuyền Gia công Robot 02',
      location_type: 'LINE',
      parent_id: 2,
      description: 'Trạm gắp phôi và cánh tay robot đa trục',
      is_active: true
    },
    {
      id: 8,
      code: 'LINE-FEEDER',
      name: 'Dây chuyền Cấp liệu Hạt nhựa',
      location_type: 'LINE',
      parent_id: 3,
      description: 'Băng tải cấp liệu phễu và đường ống khí nén',
      is_active: true
    }
  ],

  // 5. Mã lỗi kỹ thuật (failure_codes)
  failure_codes: [
    { id: 1, code: 'FAIL-OIL-01', name: 'Nhiệt độ dầu nén vượt ngưỡng an toàn', category: 'Nhiệt - Dầu nhớt', is_active: true },
    { id: 2, code: 'FAIL-VIB-02', name: 'Độ rung cơ khí bất thường do lệch trục', category: 'Cơ khí - Truyền động', is_active: true },
    { id: 3, code: 'FAIL-ELEC-03', name: 'Điểm nóng tiếp xúc thanh cái phân phối', category: 'Điện - Phân phối', is_active: true },
    { id: 4, code: 'FAIL-PNEU-04', name: 'Tụt áp đường ống khí nén thứ cấp', category: 'Khí nén', is_active: true }
  ],

  // 6. Tài sản & Thiết bị (assets) - 150 thiết bị trong nhà máy, các thiết bị trọng yếu xuất hiện trên dashboard
  assets: [
    {
      id: 1,
      asset_code: 'AC-04',
      name: 'Máy nén khí trục vít AC-04',
      location_id: 5,
      parent_asset_id: null,
      priority: 'CRITICAL',
      required_specialty_id: 1,
      status: 'MAINTENANCE',
      current_meter: 1985.5,
      meter_unit: 'HOURS',
      health_score: 32, // Khớp biểu đồ Figma: ~32
      qr_code_url: 'https://risova.vn/qr/AC-04',
      installed_date: '2023-03-10',
      warranty_expiry: '2026-03-10',
      details: {
        manufacturer: 'Atlas Copco',
        model: 'GA-75 VSD+',
        serial_number: 'AC-VSD-99281',
        description: 'Máy nén khí biến tần cấp khí trung tâm toàn nhà máy',
        purchase_price: 680000000,
        purchase_date: '2023-02-15'
      }
    },
    {
      id: 2,
      asset_code: 'CV-01',
      name: 'Băng tải cấp liệu CV-01',
      location_id: 8,
      parent_asset_id: null,
      priority: 'HIGH',
      required_specialty_id: 1,
      status: 'ACTIVE',
      current_meter: 4210.0,
      meter_unit: 'HOURS',
      health_score: 65, // Khớp biểu đồ Figma: ~65
      qr_code_url: 'https://risova.vn/qr/CV-01',
      installed_date: '2022-08-20',
      warranty_expiry: '2025-08-20',
      details: {
        manufacturer: 'Habasit',
        model: 'CV-MOD-400',
        serial_number: 'HB-44021',
        description: 'Băng tải con lăn bọc cao su chịu tải hạt nhựa phân xưởng B',
        purchase_price: 185000000,
        purchase_date: '2022-07-10'
      }
    },
    {
      id: 3,
      asset_code: 'RB-03',
      name: 'Robot hàn tự động RB-03',
      location_id: 7,
      parent_asset_id: null,
      priority: 'HIGH',
      required_specialty_id: 4,
      status: 'ACTIVE',
      current_meter: 1920.0,
      meter_unit: 'HOURS',
      health_score: 95, // Khớp biểu đồ Figma: ~95
      qr_code_url: 'https://risova.vn/qr/RB-03',
      installed_date: '2024-01-15',
      warranty_expiry: '2027-01-15',
      details: {
        manufacturer: 'Fanuc',
        model: 'ARC Mate 100iD',
        serial_number: 'FN-ROB-8831',
        description: 'Robot cánh tay 6 bậc tự do kèm đầu cấp dây và nguồn hàn số',
        purchase_price: 920000000,
        purchase_date: '2023-12-01'
      }
    },
    {
      id: 4,
      asset_code: 'MDB-01',
      name: 'Tủ điện phân phối chính MDB-01',
      location_id: 5,
      parent_asset_id: null,
      priority: 'CRITICAL',
      required_specialty_id: 2,
      status: 'ACTIVE',
      current_meter: 8760.0,
      meter_unit: 'HOURS',
      health_score: 90, // Khớp biểu đồ Figma: ~90
      qr_code_url: 'https://risova.vn/qr/MDB-01',
      installed_date: '2021-05-10',
      warranty_expiry: '2026-05-10',
      details: {
        manufacturer: 'Schneider Electric',
        model: 'PrismaSeT P 3200A',
        serial_number: 'SE-MDB-1002',
        description: 'Tủ phân phối hạ thế tổng cung cấp nguồn toàn bộ nhà máy',
        purchase_price: 450000000,
        purchase_date: '2021-04-01'
      }
    },
    {
      id: 5,
      asset_code: 'CT-02',
      name: 'Tháp giải nhiệt làm mát CT-02',
      location_id: 5,
      parent_asset_id: null,
      priority: 'MEDIUM',
      required_specialty_id: 3,
      status: 'ACTIVE',
      current_meter: 3450.0,
      meter_unit: 'HOURS',
      health_score: 88, // Khớp biểu đồ Figma: ~88
      qr_code_url: 'https://risova.vn/qr/CT-02',
      installed_date: '2023-06-01',
      warranty_expiry: '2026-06-01',
      details: {
        manufacturer: 'Liang Chi',
        model: 'LBC-150RT',
        serial_number: 'LC-CT-502',
        description: 'Hệ thống tháp tuần hoàn giải nhiệt máy nén và máy ép nhựa',
        purchase_price: 210000000,
        purchase_date: '2023-05-10'
      }
    },
    {
      id: 6,
      asset_code: 'P-08',
      name: 'Bơm cấp nước tuần hoàn P-08',
      location_id: 5,
      parent_asset_id: 5,
      priority: 'MEDIUM',
      required_specialty_id: 1,
      status: 'ACTIVE',
      current_meter: 5600.0,
      meter_unit: 'HOURS',
      health_score: 80, // Khớp biểu đồ Figma: ~80
      qr_code_url: 'https://risova.vn/qr/P-08',
      installed_date: '2022-11-12',
      warranty_expiry: '2025-11-12',
      details: {
        manufacturer: 'Ebara',
        model: '3M 50-200/15',
        serial_number: 'EB-PUMP-992',
        description: 'Bơm ly tâm trục ngang cấp nước tháp làm mát',
        purchase_price: 75000000,
        purchase_date: '2022-10-15'
      }
    },
    {
      id: 7,
      asset_code: 'CNC-01',
      name: 'Máy phay trung tâm 5 trục CNC-01',
      location_id: 2,
      parent_asset_id: null,
      priority: 'CRITICAL',
      required_specialty_id: 1,
      status: 'ACTIVE',
      current_meter: 2840.0,
      meter_unit: 'HOURS',
      health_score: 92,
      qr_code_url: 'https://risova.vn/qr/CNC-01',
      installed_date: '2023-09-01',
      warranty_expiry: '2026-09-01',
      details: {
        manufacturer: 'Mazak',
        model: 'Variaxis i-700',
        serial_number: 'MZ-88210',
        description: 'Gia công chi tiết khuôn mẫu chính xác cao',
        purchase_price: 2400000000,
        purchase_date: '2023-08-01'
      }
    },
    {
      id: 8,
      asset_code: 'INJ-05',
      name: 'Máy ép nhựa thủy lực 250T INJ-05',
      location_id: 3,
      parent_asset_id: null,
      priority: 'HIGH',
      required_specialty_id: 1,
      status: 'BROKEN',
      current_meter: 6200.0,
      meter_unit: 'HOURS',
      health_score: 25,
      qr_code_url: 'https://risova.vn/qr/INJ-05',
      installed_date: '2021-02-15',
      warranty_expiry: '2024-02-15',
      details: {
        manufacturer: 'Engel',
        model: 'victory 250',
        serial_number: 'ENG-250-112',
        description: 'Ép thân vỏ linh kiện kỹ thuật số',
        purchase_price: 1350000000,
        purchase_date: '2021-01-10'
      }
    }
  ],

  // 7. Ngưỡng cảnh báo cảm biến (asset_thresholds)
  asset_thresholds: [
    { id: 1, asset_id: 1, metric_type: 'TEMPERATURE', unit: '°C', warning_limit: 95.0, danger_limit: 105.0 },
    { id: 2, asset_id: 1, metric_type: 'PRESSURE', unit: 'bar', warning_limit: 8.5, danger_limit: 9.5 },
    { id: 3, asset_id: 2, metric_type: 'VIBRATION', unit: 'mm/s', warning_limit: 5.0, danger_limit: 7.0 },
    { id: 4, asset_id: 4, metric_type: 'TEMPERATURE', unit: '°C', warning_limit: 55.0, danger_limit: 65.0 },
    { id: 5, asset_id: 3, metric_type: 'MOTOR_TEMP', unit: '°C', warning_limit: 60.0, danger_limit: 75.0 }
  ],

  // 8. Dữ liệu đo đạc cảm biến (telemetry_logs)
  telemetry_logs: [
    { id: 101, asset_id: 1, metric_type: 'TEMPERATURE', unit: '°C', value: 108.4, source: 'IOT_SENSOR', recorded_by: null, recorded_at: '2025-06-18T10:40:00Z' },
    { id: 102, asset_id: 2, metric_type: 'VIBRATION', unit: 'mm/s', value: 7.2, source: 'IOT_SENSOR', recorded_by: null, recorded_at: '2025-06-18T10:35:00Z' },
    { id: 103, asset_id: 4, metric_type: 'TEMPERATURE', unit: '°C', value: 67.5, source: 'IOT_SENSOR', recorded_by: null, recorded_at: '2025-06-18T10:20:00Z' },
    { id: 104, asset_id: 3, metric_type: 'MOTOR_TEMP', unit: '°C', value: 48.0, source: 'IOT_SENSOR', recorded_by: null, recorded_at: '2025-06-18T10:42:00Z' },
    { id: 105, asset_id: 5, metric_type: 'TEMPERATURE', unit: '°C', value: 31.5, source: 'IOT_SENSOR', recorded_by: null, recorded_at: '2025-06-18T10:44:00Z' }
  ],

  // 9. Cảnh báo thời gian thực (alerts) - Khớp danh sách "Cảnh báo IoT gần đây" trên Dashboard
  alerts: [
    {
      id: 1,
      asset_id: 1,
      threshold_id: 1,
      level: 'DANGER',
      status: 'OPEN',
      trigger_value: 108.4,
      threshold_val: 105.0,
      title: 'Nhiệt độ dầu nén',
      description: 'Máy nén khí trục vít AC-04 | 108.4° - Ngưỡng > 105 °C',
      triggered_at: '2025-06-18T07:45:00Z',
      acknowledged_by: null,
      acknowledged_at: null,
      resolved_at: null,
      work_order_id: 1
    },
    {
      id: 2,
      asset_id: 2,
      threshold_id: 3,
      level: 'WARNING',
      status: 'OPEN',
      trigger_value: 7.2,
      threshold_val: 7.0,
      title: 'Độ rung động cơ',
      description: 'Băng tải cấp liệu CV-01 | 7.2 - Ngưỡng > 7 mm/s',
      triggered_at: '2025-06-18T08:15:00Z',
      acknowledged_by: null,
      acknowledged_at: null,
      resolved_at: null,
      work_order_id: 2
    },
    {
      id: 3,
      asset_id: 4,
      threshold_id: 4,
      level: 'WARNING',
      status: 'ACKNOWLEDGED',
      trigger_value: 67.5,
      threshold_val: 65.0,
      title: 'Nhiệt độ thanh cái',
      description: 'Tủ điện phân phối MDB-01 | 67.5 - Ngưỡng > 65 °C',
      triggered_at: '2025-06-18T07:10:00Z',
      acknowledged_by: 1,
      acknowledged_at: '2025-06-18T08:00:00Z',
      resolved_at: null,
      work_order_id: 4
    }
  ],

  // 10. Kế hoạch bảo trì định kỳ (maintenance_schedules) - Khớp "Bảo trì sắp tới"
  maintenance_schedules: [
    {
      id: 1,
      asset_id: 1,
      title: 'Bảo dưỡng máy nén 2.000 giờ',
      schedule_type: 'METER_BASED',
      assigned_specialty_id: 1,
      frequency_days: 90,
      last_completed_date: '2025-03-15T08:00:00Z',
      next_due_date: '2025-06-17T08:00:00Z',
      generate_lead_days: 7,
      meter_interval: 2000,
      last_pm_meter: 0,
      next_due_meter: 2000,
      generate_lead_meter: 100,
      estimated_duration_hours: 4.0,
      status_label: 'Quá hạn',
      badge_color: 'danger',
      display_date: '17 TH6',
      asset_code: 'AC-04',
      is_active: true
    },
    {
      id: 2,
      asset_id: 2,
      title: 'Kiểm tra băng tải hàng tháng',
      schedule_type: 'TIME_BASED',
      assigned_specialty_id: 1,
      frequency_days: 30,
      last_completed_date: '2025-05-20T08:00:00Z',
      next_due_date: '2025-06-20T08:00:00Z',
      generate_lead_days: 3,
      meter_interval: null,
      last_pm_meter: null,
      next_due_meter: null,
      generate_lead_meter: null,
      estimated_duration_hours: 2.0,
      status_label: 'Đến hạn',
      badge_color: 'warning',
      display_date: '20 TH6',
      asset_code: 'CV-01',
      is_active: true
    },
    {
      id: 3,
      asset_id: 3,
      title: 'Bôi trơn robot 2.000 giờ',
      schedule_type: 'HYBRID',
      assigned_specialty_id: 4,
      frequency_days: 120,
      last_completed_date: '2025-02-22T08:00:00Z',
      next_due_date: '2025-06-22T08:00:00Z',
      generate_lead_days: 7,
      meter_interval: 2000,
      last_pm_meter: 0,
      next_due_meter: 2000,
      generate_lead_meter: 100,
      estimated_duration_hours: 3.0,
      status_label: 'Sắp tới',
      badge_color: 'success',
      display_date: '22 TH6',
      asset_code: 'RB-03',
      is_active: true
    }
  ],

  // 11. Kho phụ tùng (spare_parts) - 2 vật tư tồn kho thấp khớp Dashboard
  spare_parts: [
    {
      id: 1,
      part_code: 'OIL-FILTER-AC',
      name: 'Lọc dầu máy nén Atlas Copco (1625-1656-00)',
      unit: 'Cái',
      quantity_in_stock: 3.0,
      reserved_quantity: 2.0,
      min_stock_level: 5.0,
      unit_price: 1450000,
      is_low_stock: true,
      category: 'Lọc dầu khí'
    },
    {
      id: 2,
      part_code: 'BELT-HTD-8M',
      name: 'Dây curoa đồng bộ răng tròn HTD 8M-1200',
      unit: 'Sợi',
      quantity_in_stock: 2.0,
      reserved_quantity: 1.0,
      min_stock_level: 4.0,
      unit_price: 850000,
      is_low_stock: true,
      category: 'Dây đai truyền động'
    },
    {
      id: 3,
      part_code: 'GREASE-SKF-LGHP2',
      name: 'Mỡ tra ổ bi chịu nhiệt cao SKF LGHP 2 (1kg)',
      unit: 'Hộp',
      quantity_in_stock: 45.0,
      reserved_quantity: 4.0,
      min_stock_level: 10.0,
      unit_price: 680000,
      is_low_stock: false,
      category: 'Mỡ bôi trơn'
    },
    {
      id: 4,
      part_code: 'BEAR-6205-2RS',
      name: 'Vòng bi cầu SKF 6205-2RS1/C3',
      unit: 'Cái',
      quantity_in_stock: 28.0,
      reserved_quantity: 6.0,
      min_stock_level: 12.0,
      unit_price: 195000,
      is_low_stock: false,
      category: 'Vòng bi'
    },
    {
      id: 5,
      part_code: 'SENS-PT100-M12',
      name: 'Cảm biến nhiệt độ công nghiệp PT100 M12x1.5',
      unit: 'Bộ',
      quantity_in_stock: 15.0,
      reserved_quantity: 1.0,
      min_stock_level: 5.0,
      unit_price: 920000,
      is_low_stock: false,
      category: 'Cảm biến IoT'
    }
  ],

  // 12. Lệnh làm việc (work_orders) - Khớp 100% bảng "Lệnh việc của tôi"
  work_orders: [
    {
      id: 1,
      wo_code: 'WO-2025-0128',
      asset_id: 1,
      asset_code: 'AC-04',
      asset_name: 'Máy nén khí trục vít AC-04',
      schedule_id: null,
      title: 'Xử lý nhiệt độ dầu nén tăng cao',
      description: 'Nhiệt độ dầu nén AC-04 đạt 108.4°C vượt ngưỡng báo động 105°C. Cần kiểm tra két làm mát dầu và thay lọc dầu.',
      wo_type: 'EMERGENCY',
      priority: 'CRITICAL',
      status: 'IN_PROGRESS',
      failure_code_id: 1,
      root_cause: 'Lưới tản nhiệt két làm mát bị bụi bám nghẽn và lọc dầu tắc nghẽn cục bộ',
      resolution_notes: 'Vệ sinh két giải nhiệt bằng khí nén, thay lọc dầu mới và châm thêm 5L dầu gốc tổng hợp.',
      hold_reason: null,
      cancel_reason: null,
      reported_by: 1,
      assigned_to: 2, // Lê Thu Hà
      verified_by: 1,
      scheduled_start: '2025-06-18T08:00:00Z',
      scheduled_end: '2025-06-18T16:00:00Z',
      actual_start: '2025-06-18T08:30:00Z',
      actual_end: null,
      labor_hours: 4.5,
      estimated_cost: 3200000,
      actual_cost: 2900000,
      created_at: '2025-06-18T07:50:00Z',
      updated_at: '2025-06-18T10:15:00Z',
      closed_at: null,
      due_date: '2025-06-18',
      checklists: [
        { id: 1, step_number: 1, task_description: 'Ngắt nguồn điện và cô lập áp suất bình tích khí', is_completed: true, note: 'Đã gắn thẻ Lockout/Tagout' },
        { id: 2, step_number: 2, task_description: 'Kiểm tra mức dầu bôi trơn tại mắt thăm dầu', is_completed: true, note: 'Mức dầu nằm dưới vạch Min' },
        { id: 3, step_number: 3, task_description: 'Vệ sinh két làm mát dầu và quạt tản nhiệt', is_completed: true, note: 'Đã thổi sạch bụi cánh tản' },
        { id: 4, step_number: 4, task_description: 'Thay thế lọc dầu mã 1625-1656-00', is_completed: false, note: 'Đang đợi xuất vật tư từ kho' },
        { id: 5, step_number: 5, task_description: 'Chạy thử nghiệm và đo nhiệt độ ổn định < 90°C', is_completed: false, note: '' }
      ],
      parts: [
        { id: 1, part_id: 1, part_code: 'OIL-FILTER-AC', part_name: 'Lọc dầu máy nén Atlas Copco', quantity_needed: 1, quantity_issued: 1, quantity_consumed: 0, status: 'ISSUED' }
      ]
    },
    {
      id: 2,
      wo_code: 'WO-2025-0127',
      asset_id: 2,
      asset_code: 'CV-01',
      asset_name: 'Băng tải cấp liệu CV-01',
      schedule_id: null,
      title: 'Căn chỉnh băng tải cấp liệu',
      description: 'Cảm biến độ rung phát hiện rung chấn 7.2 mm/s ở cụm gối đỡ đuôi băng tải. Cần căng lại dây curoa và cân tâm con lăn.',
      wo_type: 'REPAIR',
      priority: 'HIGH',
      status: 'ASSIGNED',
      failure_code_id: 2,
      root_cause: null,
      resolution_notes: null,
      hold_reason: null,
      cancel_reason: null,
      reported_by: 5,
      assigned_to: 4, // Trần Văn Tuấn
      verified_by: 1,
      scheduled_start: '2025-06-20T08:00:00Z',
      scheduled_end: '2025-06-20T12:00:00Z',
      actual_start: null,
      actual_end: null,
      labor_hours: 2.0,
      estimated_cost: 1500000,
      actual_cost: 0,
      created_at: '2025-06-18T08:20:00Z',
      updated_at: '2025-06-18T08:30:00Z',
      closed_at: null,
      due_date: '2025-06-20',
      checklists: [
        { id: 11, step_number: 1, task_description: 'Kiểm tra độ chùng dây đai HTD 8M', is_completed: false, note: '' },
        { id: 12, step_number: 2, task_description: 'Đo độ đảo gối đỡ trục con lăn', is_completed: false, note: '' },
        { id: 13, step_number: 3, task_description: 'Bơm mỡ bôi trơn chịu tải SKF LGHP 2', is_completed: false, note: '' }
      ],
      parts: [
        { id: 2, part_id: 2, part_code: 'BELT-HTD-8M', part_name: 'Dây curoa đồng bộ răng tròn HTD 8M-1200', quantity_needed: 1, quantity_issued: 0, quantity_consumed: 0, status: 'RESERVED' }
      ]
    },
    {
      id: 3,
      wo_code: 'WO-2025-0126',
      asset_id: 3,
      asset_code: 'RB-03',
      asset_name: 'Robot hàn tự động RB-03',
      schedule_id: 3,
      title: 'Bảo dưỡng robot định kỳ 2.000 giờ',
      description: 'Bảo dưỡng định kỳ theo chỉ dẫn nhà sản xuất Fanuc: kiểm tra 6 trục chuyển động, thay mỡ các khớp J1-J6, vệ sinh ray trượt.',
      wo_type: 'PREVENTIVE',
      priority: 'MEDIUM',
      status: 'OPEN',
      failure_code_id: null,
      root_cause: null,
      resolution_notes: null,
      hold_reason: null,
      cancel_reason: null,
      reported_by: 1,
      assigned_to: 2, // Lê Thu Hà
      verified_by: 1,
      scheduled_start: '2025-06-24T08:00:00Z',
      scheduled_end: '2025-06-24T17:00:00Z',
      actual_start: null,
      actual_end: null,
      labor_hours: 3.0,
      estimated_cost: 2100000,
      actual_cost: 0,
      created_at: '2025-06-17T14:00:00Z',
      updated_at: '2025-06-17T14:00:00Z',
      closed_at: null,
      due_date: '2025-06-24',
      checklists: [
        { id: 21, step_number: 1, task_description: 'Sao lưu chương trình robot vào thẻ CF', is_completed: false, note: '' },
        { id: 22, step_number: 2, task_description: 'Thay mỡ giảm tốc khớp J1 đến J6', is_completed: false, note: '' },
        { id: 23, step_number: 3, task_description: 'Hiệu chuẩn điểm gốc Zero Position', is_completed: false, note: '' }
      ],
      parts: [
        { id: 3, part_id: 3, part_code: 'GREASE-SKF-LGHP2', part_name: 'Mỡ tra ổ bi chịu nhiệt cao SKF LGHP 2', quantity_needed: 2, quantity_issued: 0, quantity_consumed: 0, status: 'RESERVED' }
      ]
    },
    {
      id: 4,
      wo_code: 'WO-2025-0125',
      asset_id: 4,
      asset_code: 'MDB-01',
      asset_name: 'Tủ điện phân phối chính MDB-01',
      schedule_id: null,
      title: 'Kiểm tra điểm nóng tủ MDB',
      description: 'Chụp ảnh nhiệt hồng ngoại phát hiện điểm tiếp xúc thanh cái Pha S lên tới 67.5°C. Cần siết lại bu lông lực và vệ sinh thanh cái.',
      wo_type: 'PREVENTIVE',
      priority: 'HIGH',
      status: 'COMPLETED',
      failure_code_id: 3,
      root_cause: 'Bu lông siết thanh cái bị lỏng sau 3 năm vận hành rung động liên tục',
      resolution_notes: 'Đã siết lực mô-men 55 N.m theo chuẩn Schneider, quét nhiệt lại giảm còn 42°C.',
      hold_reason: null,
      cancel_reason: null,
      reported_by: 1,
      assigned_to: 2, // Lê Thu Hà
      verified_by: 1,
      scheduled_start: '2025-06-16T13:00:00Z',
      scheduled_end: '2025-06-16T17:00:00Z',
      actual_start: '2025-06-16T13:15:00Z',
      actual_end: '2025-06-16T16:30:00Z',
      labor_hours: 3.25,
      estimated_cost: 1200000,
      actual_cost: 1100000,
      created_at: '2025-06-15T09:00:00Z',
      updated_at: '2025-06-16T16:45:00Z',
      closed_at: '2025-06-16T17:00:00Z',
      due_date: '2025-06-16',
      checklists: [
        { id: 31, step_number: 1, task_description: 'Đo quét ảnh nhiệt trước khi ngắt điện', is_completed: true, note: 'Điểm nóng 67.5°C tại pha S' },
        { id: 32, step_number: 2, task_description: 'Cắt máy cắt tổng và tiếp địa an toàn', is_completed: true, note: 'Đã tiếp địa 3 pha' },
        { id: 33, step_number: 3, task_description: 'Siết lại toàn bộ bu lông liên kết thanh cái bằng cần siết lực', is_completed: true, note: 'Siết lực chuẩn 55 Nm' },
        { id: 34, step_number: 4, task_description: 'Đóng điện lại và đo nhiệt sau 30 phút chạy tải', is_completed: true, note: 'Nhiệt độ hạ về 42°C, an toàn' }
      ],
      parts: []
    }
  ],

  // 13. Nhật ký xuất nhập vật tư (inventory_transactions)
  inventory_transactions: [
    {
      id: 1,
      part_id: 1,
      part_code: 'OIL-FILTER-AC',
      part_name: 'Lọc dầu máy nén Atlas Copco',
      work_order_id: 1,
      wo_code: 'WO-2025-0128',
      transaction_type: 'ISSUE',
      quantity: 1,
      performed_by: 3, // Phạm Gia Huy
      performed_by_name: 'Phạm Gia Huy',
      note: 'Xuất cấp cho WO-2025-0128 xử lý nóng máy nén khí AC-04',
      created_at: '2025-06-18T08:45:00Z'
    },
    {
      id: 2,
      part_id: 3,
      part_code: 'GREASE-SKF-LGHP2',
      part_name: 'Mỡ tra ổ bi chịu nhiệt cao SKF LGHP 2',
      work_order_id: null,
      wo_code: null,
      transaction_type: 'RECEIPT',
      quantity: 20,
      performed_by: 3,
      performed_by_name: 'Phạm Gia Huy',
      note: 'Nhập kho lô phụ tùng từ nhà phân phối SKF Việt Nam (PO-2025-992)',
      created_at: '2025-06-17T11:00:00Z'
    },
    {
      id: 3,
      part_id: 4,
      part_code: 'BEAR-6205-2RS',
      part_name: 'Vòng bi cầu SKF 6205-2RS1/C3',
      work_order_id: 4,
      wo_code: 'WO-2025-0125',
      transaction_type: 'RETURN',
      quantity: 1,
      performed_by: 3,
      performed_by_name: 'Phạm Gia Huy',
      note: 'Trả lại kho 1 vòng bi không sử dụng trong đợt bảo trì',
      created_at: '2025-06-16T17:15:00Z'
    }
  ],

  // 14. Lịch sử hoạt động gần đây (Recent Activities) - Khớp Dashboard
  activities: [
    {
      id: 1,
      type: 'WO_COMPLETE',
      user: 'Lê Thu Hà',
      title: 'Lê Thu Hà hoàn thành WO-2025-0125',
      detail: 'Kiểm tra điểm nóng tủ MDB-01 đã siết lực và quét nhiệt đạt chuẩn',
      time_ago: '35 phút trước',
      timestamp: '2025-06-18T10:10:00Z'
    },
    {
      id: 2,
      type: 'INV_ISSUE',
      user: 'Phạm Gia Huy',
      title: 'Phạm Gia Huy xuất 1 lọc dầu',
      detail: 'Cấp phát phụ tùng OIL-FILTER-AC cho lệnh sửa chữa khẩn cấp AC-04',
      time_ago: '2 giờ trước',
      timestamp: '2025-06-18T08:45:00Z'
    },
    {
      id: 3,
      type: 'IOT_ALERT',
      user: 'Hệ thống IoT',
      title: 'Hệ thống tạo cảnh báo nhiệt độ',
      detail: 'Cảm biến PT100 đo nhiệt độ dầu máy nén AC-04 vượt 108.4°C (> 105°C)',
      time_ago: '3 giờ trước',
      timestamp: '2025-06-18T07:45:00Z'
    }
  ],

  // 15. Nhật ký kiểm toán hệ thống (audit_logs)
  audit_logs: [
    {
      id: 1001,
      user_id: 1,
      user_name: 'Minh Anh',
      action: 'CREATE_WORK_ORDER',
      entity_type: 'WORK_ORDER',
      entity_id: 'WO-2025-0128',
      old_value: null,
      new_value: { priority: 'CRITICAL', type: 'EMERGENCY', asset: 'AC-04' },
      ip_address: '192.168.1.15',
      created_at: '2025-06-18T07:50:00Z'
    },
    {
      id: 1002,
      user_id: 3,
      user_name: 'Phạm Gia Huy',
      action: 'ISSUE_INVENTORY',
      entity_type: 'SPARE_PART',
      entity_id: 'OIL-FILTER-AC',
      old_value: { in_stock: 4, reserved: 2 },
      new_value: { in_stock: 3, reserved: 1 },
      ip_address: '192.168.1.42',
      created_at: '2025-06-18T08:45:00Z'
    },
    {
      id: 1003,
      user_id: 2,
      user_name: 'Lê Thu Hà',
      action: 'UPDATE_CHECKLIST',
      entity_type: 'WORK_ORDER_CHECKLIST',
      entity_id: 'WO-2025-0128-STEP-3',
      old_value: { is_completed: false },
      new_value: { is_completed: true, note: 'Đã thổi sạch bụi két làm mát' },
      ip_address: '192.168.1.88',
      created_at: '2025-06-18T09:30:00Z'
    },
    {
      id: 1004,
      user_id: 2,
      user_name: 'Lê Thu Hà',
      action: 'CLOSE_WORK_ORDER',
      entity_type: 'WORK_ORDER',
      entity_id: 'WO-2025-0125',
      old_value: { status: 'IN_PROGRESS' },
      new_value: { status: 'COMPLETED' },
      ip_address: '192.168.1.88',
      created_at: '2025-06-16T16:45:00Z'
    }
  ]
};

