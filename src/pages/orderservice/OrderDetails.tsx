import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getOrderById } from "../../services/orderService";

interface OrderItem {
  name?: string;
  productId?: string;
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

export function OrderDetails() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    if (!id) {
      setError("Order ID not found");
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please login to view order details");
        return;
      }

      const res = await getOrderById(id, token);
      setOrder(res.data);
    } catch (err) {
      console.error("Failed to fetch order:", err);
      setError("Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading order details...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!order) return <div className="p-8 text-center">Order not found</div>;

  return (
    <div className="p-8">
      <Link to="/orders" className="text-blue-600 hover:underline mb-4 inline-block">
        ← Back to Orders
      </Link>

      <h1 className="text-2xl font-bold mb-4">Order Details</h1>

      <div className="border rounded-lg p-6 space-y-3">
        <p><strong>Order ID:</strong> {order._id}</p>
        <p><strong>Status:</strong> 
          <span className={`ml-2 px-2 py-1 rounded text-sm ${
            order.status === 'completed' ? 'bg-green-100 text-green-800' :
            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {order.status || 'Processing'}
          </span>
        </p>
        <p><strong>Total Amount:</strong> ${order.totalAmount}</p>
        {order.createdAt && (
          <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
        )}

        <h2 className="text-xl font-bold mt-6 mb-3">Items</h2>
        <div className="space-y-2">
          {order.items && order.items.length > 0 ? (
            order.items.map((item, i) => (
              <div key={i} className="border-t pt-2">
                <p><strong>Product:</strong> {item.name || item.productId || 'Unknown'}</p>
                <p><strong>Quantity:</strong> {item.quantity}</p>
                <p><strong>Price:</strong> ${item.price}</p>
                <p><strong>Subtotal:</strong> ${item.price * item.quantity}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No items in this order</p>
          )}
        </div>
      </div>
    </div>
  );
}