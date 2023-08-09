import Layout from "@/components/Layout";
import {useEffect, useState} from "react";
import axios from "axios";
import Spinner_alt from "@/components/Spinner_alt";
import EditOrderModal from "@/components/EditOrderModal";

export default function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [products, setProducts] = useState([]);
    const [productsLoading, setProductsLoading] = useState(false);

    useEffect(() => {
        setProductsLoading(true);
        axios.get("/api/products").then(res => {
            setProducts(res.data);
            setProductsLoading(false);
        });
    }, []);

    const handleEditClick = (orderId) => {
        const order = orders.find((order) => order._id === orderId);
        setSelectedOrder(order);
    };

    const handleCloseModal = () => {
        setSelectedOrder(null);
    };

    const fetchOrders = async () => {
        const response = await axios.get('/api/orders');
        setOrders(response.data);
        setIsLoading(false);
    }

    const togglePaidStatus = async (orderId) => {
        const order = orders.find((order) => order._id === orderId);
        await axios.put(`/api/orders`, {
            orderId: order._id,
            paid: !order.paid,
        });
        await fetchOrders();
    }

    // function formatNumber(num) {
    //     return new Intl.NumberFormat('de-DE').format(num);
    // }

    useEffect(() => {
        fetchOrders();
    }, []);

    return (
        <Layout>
            <h1>Đơn hàng</h1>
            <table className="basic">
                <thead>
                <tr>
                    <th>Mã đơn hàng</th>
                    <th>Thanh toán</th>
                    <th>tên khách hàng</th>
                    <th>địa chỉ</th>
                    <th>Số điện thoại</th>
                    <th>Sản phẩm</th>
                    {/*<th>tổng hoá đơn</th>*/}
                    <th></th>
                </tr>
                </thead>
                <tbody>
                {productsLoading && (
                    <Spinner_alt fullWidth={true}/>
                )}
                {isLoading && (
                    <tr>
                        <td colSpan={10}>
                            <div className="py-4">
                                <Spinner_alt fullWidth={true}/>
                            </div>
                        </td>
                    </tr>
                )}
                {orders.length > 0 && orders.map(order => (
                    <tr key={order.orderId}>
                        {/*<td>{(new Date(order.createdAt)).toLocaleString()}</td>*/}
                        <td>{order.orderId}</td>
                        <td className={order.paid ? 'text-green-600' : 'text-red-600'}>
                            <div className="flex items-center">
                                {order.paid ? 'YES' : 'NO'}
                                <input type="checkbox" className="mt-2" checked={order.paid}
                                       onChange={() => togglePaidStatus(order._id)}/>
                            </div>
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
                        {/*<td>{formatNumber(order.total_price)} ₫</td>*/}
                        <td>
                            <button onClick={() => handleEditClick(order._id)}>Chi tiết</button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
            {selectedOrder && (
                <EditOrderModal isOpen={true} onClose={handleCloseModal} order={selectedOrder} products={products}/>
            )}
        </Layout>
    );
}
