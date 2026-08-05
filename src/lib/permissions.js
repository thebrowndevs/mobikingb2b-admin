// resources
export const Resources = {
    DASHBOARD: 'dashboard',
    POS: 'pos',
    POS_ORDERS: 'posOrders',
    MANUAL_ORDER: 'manual-order',
    ORDERS: 'orders',
    RETURN_REQUESTS: 'return-requests',
    CANCEL_REQUESTS: 'cancel-requests',
    PAYMENT_LINKS: 'payment-links',
    QUERIES: 'queries',
    CATEGORIES: 'categories',
    SUB_CATEGORIES: 'subCategories',
    PRODUCTS: 'products',
    BRANDS: 'brands',
    DESIGN_STUDIO: 'design-studio',
    HOME_LAYOUT: 'home-layout',
    COUPON_CODES: 'couponCodes',
    CUSTOMERS: 'customers',
    EMPLOYEES: 'employees',
    NOTIFICATIONS: 'notifications',
    REPORTS: 'reports',
    POLICIES: 'policies',
    BLOGS: 'blogs',
    REFUND: 'refund',
    PARTIAL_RETURN_REQUESTS: 'partial-return-requests',
};

// possible actions
export const Actions = {
    VIEW: 'view',
    ADD: 'add',
    EDIT: 'edit',
    DELETE: 'delete',
};

// Frontend helper to check permissions against session.user
export function checkPermission(user, resource, action) {
    if (!user) return false;
    if (user.role === 'admin') return true;
    if (user.role === 'employee') {
        const perms = user.permissions?.[resource];
        return !!perms?.[action];
    }
    return false;
}

export function onlyAdminPermission(user) {
    if (user?.role === 'admin') return true;
    return false;
}