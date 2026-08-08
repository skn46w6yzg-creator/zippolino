export const createOrderId = () => `ZIP-${Date.now().toString(36)}-${crypto.randomUUID().slice(0, 4)}`;

export const PENDING_PAYMENT_STATUS = 'Pending payment';
export const canPrepareOrder = order => order.status !== PENDING_PAYMENT_STATUS;
