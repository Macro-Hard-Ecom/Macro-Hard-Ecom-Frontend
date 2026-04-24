import axios from "axios";

const PAYMENT_API_URL = import.meta.env.VITE_PAYMENT_SERVICE_URL || "http://3.89.71.141:8084/api/payments";

// Process a payment for an order
export const processPayment = async (
  orderId: string,
  paymentMethod: string,
  token: string
) => {
  return axios.post(
    `${PAYMENT_API_URL}/processPayment`,
    { orderId, paymentMethod },
    { headers: { Authorization: `Bearer ${token}` } }
  );
};

// Get payment status by paymentId
export const getPaymentStatus = async (paymentId: string, token: string) => {
  return axios.get(`${PAYMENT_API_URL}/status/${paymentId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Get payment details by orderId
export const getPaymentByOrder = async (orderId: string, token: string) => {
  return axios.get(`${PAYMENT_API_URL}/order/${orderId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Refund a payment
export const refundPayment = async (
  paymentId: string,
  reason: string,
  token: string
) => {
  return axios.post(
    `${PAYMENT_API_URL}/refundPayment`,
    { paymentId, reason },
    { headers: { Authorization: `Bearer ${token}` } }
  );
};

// Get payment stats (admin)
export const getPaymentStats = async (token: string) => {
  return axios.get(`${PAYMENT_API_URL}/stats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Get payments for a user
export const getPaymentsByUser = async (userId: string, token: string) => {
  return axios.get(`${PAYMENT_API_URL}/user/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};