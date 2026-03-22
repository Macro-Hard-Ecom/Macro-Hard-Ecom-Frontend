import axios from "axios";

const API_URL = "http://51.21.181.2:5000/api/orders";

//Create Order
export const createOrder = async (items: any[], token: string) => {
  return axios.post(
    `${API_URL}/createOrder`,
    { items },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

// Get All Orders
export const getOrders = async (token: string) => {
  return axios.get(`${API_URL}/orders`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Get Order By ID
export const getOrderById = async (id: string, token: string) => {
  return axios.get(`${API_URL}/order/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

