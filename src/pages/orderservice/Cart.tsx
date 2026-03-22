import { useCart } from "../../context/CartContext";
import { createOrder } from "../../services/orderService";

export function Cart() {
  const { cart, removeFromCart, clearCart } = useCart();

  const handleOrder = async () => {
    try {
      const token = localStorage.getItem("token");

      const items = cart.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
      }));

      const res = await createOrder(items, token!);

      alert("Order Created!");

      clearCart(); 
      console.log("Order ID:", res.data._id);

    } catch (err) {
      console.error(err);
      alert("Order failed");
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Cart</h1>

      {cart.length === 0 ? (
        <p>No items in cart</p>
      ) : (
        <>
          {cart.map((item) => (
            <div key={item.productId} className="border p-4 mb-3">
              <p>{item.name}</p>
              <p>Qty: {item.quantity}</p>
              <p>${item.price}</p>

              <button
                onClick={() => removeFromCart(item.productId)}
                className="text-red-500"
              >
                Remove
              </button>
            </div>
          ))}

          <button
            onClick={handleOrder}
            className="bg-green-600 text-white px-6 py-2 mt-4"
          >
            Place Order
          </button>
        </>
      )}
    </div>
  );
}