import Modal from 'react-modal';

const EditOrderModal = ({ isOpen, onClose, order }) => {
    if (!isOpen) return null;

    function formatNumber(num) {
        return new Intl.NumberFormat('de-DE').format(num);
    }

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            contentLabel="Edit Order Modal"
        >
            <h1>Đơn hàng</h1>
            <table className="basic">
                <thead>
                <tr>
                    <th>Thời gian</th>
                    <th>Mã đơn hàng</th>
                    <th>tên khách hàng</th>
                    <th>địa chỉ</th>
                    <th>Số điện thoại</th>
                    <th>Sản phẩm</th>
                    <th>tổng hoá đơn</th>
                </tr>
                </thead>
                <tbody>
                <tr>
                    <td>{(new Date(order.createdAt)).toLocaleString()}</td>
                    <td>{order._id}</td>
                    <td>{order.name}</td>
                    <td>{order.address}</td>
                    <td>{order.phone}</td>
                    <td>
                        {order.line_items.map((l) => (
                            <>
                                {l.name} x
                                {l.quantity}<br />
                            </>
                        ))}
                    </td>
                    <td>{formatNumber(order.total_price)} ₫</td>
                </tr>
                </tbody>
            </table>
            <button onClick={onClose}>Close</button>
        </Modal>
    );
};

export default EditOrderModal;
