import { useState } from "react";
import { createOrder } from "../../services/orderService";

interface CartItem {
  productId: string;
  quantity: number;
}

export function Cart() {
  const [items] = useState<CartItem[]>([
    {
      productId: "69bed7bdd55fa1a04f1cf48e",
      quantity: 1,
    },
  ]);

  const handleOrder = async () => {
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        alert("Please login first");
        return;
      }

      const res = await createOrder(items, token);

      alert("Order Created!");
      console.log(res.data);
    } catch (err) {
      console.error(err);
      alert("Order failed");
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Cart</h1>

      {items.map((item, index) => (
        <div key={index}>
          Product: {item.productId} | Qty: {item.quantity}
        </div>
      ))}

      <button
        onClick={handleOrder}
        className="bg-green-600 text-white px-4 py-2 mt-4"
      >
        Place Order
      </button>
    </div>
  );
}