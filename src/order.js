export const createOrderId = () => `ZIP-${Date.now().toString(36)}-${crypto.randomUUID().slice(0, 4)}`;

