export const ACCESS = {
  NONE: 'none',
  VIEW: 'view',
  CREATE_VIEW: 'create_view',
  FULL: 'full',
};

export const ROLE_PERMISSIONS = {
  ADMIN: {
    dashboard: ACCESS.FULL,
    assets: ACCESS.FULL,
    locations: ACCESS.FULL,
    'work-orders': ACCESS.FULL,
    schedules: ACCESS.FULL,
    inventory: ACCESS.FULL,
    iot: ACCESS.FULL,
    users: ACCESS.FULL,
    audit: ACCESS.FULL,
    reports: ACCESS.FULL,
    admin: ACCESS.FULL,
    profile: ACCESS.FULL,
  },
  MANAGER: {
    dashboard: ACCESS.FULL,
    assets: ACCESS.FULL,
    locations: ACCESS.FULL,
    'work-orders': ACCESS.FULL,
    schedules: ACCESS.FULL,
    inventory: ACCESS.FULL,
    iot: ACCESS.FULL,
    users: ACCESS.FULL,
    audit: ACCESS.FULL,
    reports: ACCESS.FULL,
    admin: ACCESS.NONE,
    profile: ACCESS.FULL,
  },
  TECHNICIAN: {
    dashboard: ACCESS.FULL,
    assets: ACCESS.FULL,
    locations: ACCESS.FULL,
    'work-orders': ACCESS.FULL,
    schedules: ACCESS.FULL,
    inventory: ACCESS.VIEW,
    iot: ACCESS.FULL,
    users: ACCESS.NONE,
    audit: ACCESS.NONE,
    reports: ACCESS.NONE,
    admin: ACCESS.NONE,
    profile: ACCESS.FULL,
  },
  INVENTORY_STAFF: {
    dashboard: ACCESS.FULL,
    assets: ACCESS.VIEW,
    locations: ACCESS.VIEW,
    'work-orders': ACCESS.FULL,
    schedules: ACCESS.NONE,
    inventory: ACCESS.FULL,
    iot: ACCESS.NONE,
    users: ACCESS.NONE,
    audit: ACCESS.NONE,
    reports: ACCESS.NONE,
    admin: ACCESS.NONE,
    profile: ACCESS.FULL,
  },
  STAFF: {
    dashboard: ACCESS.FULL,
    assets: ACCESS.VIEW,
    locations: ACCESS.VIEW,
    'work-orders': ACCESS.CREATE_VIEW,
    schedules: ACCESS.NONE,
    inventory: ACCESS.NONE,
    iot: ACCESS.VIEW,
    users: ACCESS.NONE,
    audit: ACCESS.NONE,
    reports: ACCESS.NONE,
    admin: ACCESS.NONE,
    profile: ACCESS.FULL,
  },
};

export const ALL_ROLES = ['ADMIN', 'MANAGER', 'TECHNICIAN', 'INVENTORY_STAFF', 'STAFF'];

export function getAccess(role, page) {
  return ROLE_PERMISSIONS[role]?.[page] || ACCESS.NONE;
}

export function canAccessPage(role, page) {
  return getAccess(role, page) !== ACCESS.NONE;
}

export function canManagePage(role, page) {
  return getAccess(role, page) === ACCESS.FULL;
}

export function canCreateOnPage(role, page) {
  const access = getAccess(role, page);
  return access === ACCESS.FULL || access === ACCESS.CREATE_VIEW;
}

export function isAdmin(role) {
  return role === 'ADMIN';
}
