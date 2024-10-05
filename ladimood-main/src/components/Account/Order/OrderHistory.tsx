import React, { useEffect, useState } from 'react';
import { getPastOrders } from '@/api/account/axios';
import { Order, OrderItem } from '@/app/types/types';

const OrderHistory: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const data = await getPastOrders();
                setOrders(data);
            } catch (err) {
                setError('Failed to fetch order history.');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    if (loading) {
        return <div className="text-center text-sm text-gray-400">Loading your orders...</div>;
    }

    if (error) {
        return <div className="text-red-500 text-center">{error}</div>;
    }

    return (
        <div className="shadow-md rounded-lg p-4 max-w-3xl mx-auto border border-[#0097B2]">
            {orders.length > 0 ? (
                <div className="space-y-4">
                    {orders.map(order => (
                        <div 
                            key={order.id} 
                            className="border border-gray-200 rounded-lg p-4 hover:shadow transition-shadow bg-white"
                        >
                            <div className="flex justify-between items-start text-sm">
                                <div className="space-y-1">
                                    <p className="font-semibold text-[#0097B2]">Order #{order.id}</p>
                                    <p className="text-gray-500">Total: €{order.total_price.toFixed(2)}</p>
                                    <p className="text-gray-400">Placed on: {new Date(order.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                            {/* Order Items */}
                            <div className="mt-4 text-sm text-gray-600">
                                <p className="font-medium mb-2">Items:</p>
                                <ul className="list-disc pl-4 space-y-2">
                                    {order.items.map((item: OrderItem) => (
                                        <li key={item.id} className="flex justify-between items-center">
                                            <div>
                                                <span className="font-semibold text-gray-800">{item.product.name}</span>
                                                <span className="ml-2 text-gray-600">Qty: {item.quantity}</span>
                                                <span className="ml-2 text-gray-600">Color: {item.color}</span>
                                                <span className="ml-2 text-gray-600">Size: {item.size}</span>
                                            </div>
                                            <span className="text-gray-800 font-semibold">
                                                €{item.price.toFixed(2)}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-[#0097B2] text-sm font-medium">
                    You have no orders yet. Start shopping and make your first purchase!
                </p>
            )}
        </div>
    );
};

export default OrderHistory;
