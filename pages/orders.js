import Layout from "@/components/Layout";
import { useEffect, useState } from "react";
import axios from "axios";

export default function OrdersPage() {
    const [orders, setOrders] = useState([]);

    const fetchOrders = async () => {
        const response = await axios.get('/api/orders');
        setOrders(response.data);
    }

    const togglePaidStatus = async (orderId) => {
        const order = orders.find((order) => order._id === orderId);
        await axios.put(`/api/orders`, {
            orderId: order._id,
            paid: !order.paid,
        });
        await fetchOrders();
    }
    function formatNumber(num) {
        return new Intl.NumberFormat('de-DE').format(num);
    }


    useEffect(() => {
        fetchOrders();
    }, []);

    return (
        <Layout>
            <h1>Đơn hàng</h1>
            <table className="basic">
                <thead>
                    <tr>
                        <th>Ngày đặt</th>
                        <th>Thanh toán</th>
                        <th>tên khách hàng</th>
                        <th>địa chỉ</th>
                        <th>Số điện thoại</th>
                        <th>Sản phẩm</th>
                        <th>tổng hoá đơn</th>
                    </tr>
                </thead>
                <tbody>
                {orders.length > 0 && orders.map(order => (
                    <tr key={order._id}>
                        <td>{(new Date(order.createdAt)).toLocaleString()}</td>
                        <td className={order.paid ? 'text-green-600' : 'text-red-600' + 'flex justify-center items-center'}>
                            {order.paid ? 'YES' : 'NO'}
                            <input type="checkbox" checked={order.paid} onChange={() => togglePaidStatus(order._id)} />
                        </td>
                        <td>{order.name}</td>
                        <td>{order.address}</td>
                        <td>{order.phone}</td>
                        <td>
                            {order.line_items.map(l => (
                                <>
                                    {l.name} x
                                    {l.quantity}<br />
                                </>
                            ))}
                        </td>
                        <td>{formatNumber(order.total_price)} ₫</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </Layout>
    );
}
