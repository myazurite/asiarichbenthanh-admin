import Modal from 'react-modal';
import {useEffect, useState} from "react";
import axios from "axios";
import Spinner_alt from "@/components/Spinner_alt";

const EditOrderModal = ({ isOpen, onClose, order, products }) => {
    const [productsLoading, setProductsLoading] = useState(false);
    const [editedLineItems, setEditedLineItems] = useState(order.line_items);
    const [editedAddress, setEditedAddress] = useState(order.address);
    const [editedPhone, setEditedPhone] = useState(order.phone);

    if (!isOpen) return null;

    function formatNumber(num) {
        return new Intl.NumberFormat('de-DE').format(num);
    }

    const handleProductChange = (index, productId) => {
        setEditedLineItems((prevLineItems) => {
            const updatedLineItems = [...prevLineItems];
            updatedLineItems[index].product = productId;
            const product = products.find((p) => p._id === productId);
            if (product) {
                updatedLineItems[index].name = product.title;
                updatedLineItems[index].price_data.unit_amount = product.discountedPrice || product.price;
            }
            return updatedLineItems;
        });
    };

    const handleInputChange = (e, index) => {
        const { name, value } = e.target;
        if (name === "address") {
            setEditedAddress(value);
        } else if (name === "phone") {
            setEditedPhone(value);
        } else {
            setEditedLineItems((prevLineItems) => {
                const updatedLineItems = [...prevLineItems];
                updatedLineItems[index] = { ...updatedLineItems[index], [name]: value };
                return updatedLineItems;
            });
        }
    };

    function calculateTotalPrice() {
        let total = 0;
        editedLineItems.forEach((item) => {
            total += item.quantity * item.price_data.unit_amount;
        });
        return total;
    }

    const handleSaveChanges = async () => {
        try {
            setProductsLoading(true);

            const updatedOrder = {
                ...order,
                line_items: editedLineItems,
                address: editedAddress,
                phone: editedPhone,
                total_price: calculateTotalPrice(),
            };

            await axios.put(`/api/orders`, {
                orderId: order._id,
                order: updatedOrder,
            });

            setProductsLoading(false);
            onClose();
        } catch (error) {
            console.error("Error updating order:", error);
            setProductsLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            contentLabel="Edit Order Modal"
        >
            <h1>Đơn hàng</h1>
            <div>
                <label>Thời gian đặt hàng:</label>
                <div>{(new Date(order.createdAt)).toLocaleString()}</div>
            </div>
            <div>
                <label>Mã đơn hàng:</label>
                <input
                    type="text"
                    name="orderId"
                    value={order.orderId}
                    readOnly
                />
            </div>
            <div>
                <label>Tên khách hàng:</label>
                <input
                    type="text"
                    name="name"
                    value={order.name}
                    readOnly
                />
            </div>
            <div>
                <label>Địa chỉ:</label>
                <input
                    type="text"
                    name="address"
                    value={editedAddress}
                    onChange={(e) => handleInputChange(e)}
                />
            </div>
            <div>
                <label>Số điện thoại:</label>
                <input
                    type="text"
                    name="phone"
                    value={editedPhone}
                    onChange={(e) => handleInputChange(e)}
                />
            </div>
            <div>
                {productsLoading && (
                    <Spinner_alt fullWidth={true}/>
                )}
                <label>Sản phẩm:</label>
                {editedLineItems.map((item, index) => (
                    <div key={item._id}>
                        <select
                            name="product"
                            value={item._id}
                            onChange={(e) => handleProductChange(index, e.target.value)}
                        >
                            <option value="">{item.name}</option>
                            {products.map((product) => (
                                <option key={product._id} value={product._id}>
                                    {product.title}
                                </option>
                            ))}
                        </select>
                        <input
                            type="number"
                            name="quantity"
                            value={item.quantity}
                            onChange={(e) => handleInputChange(e, index)}
                            placeholder="Số lượng"
                        />
                    </div>
                ))}
            </div>
            <div>
                <label>Tổng hoá đơn:</label>
                <div>{formatNumber(calculateTotalPrice())} ₫</div>
            </div>
            <button className="btn-default mr-1" onClick={handleSaveChanges}>Save Changes</button>
            <button className="btn-default" onClick={onClose}>Close</button>
        </Modal>
    );
};

export default EditOrderModal;
