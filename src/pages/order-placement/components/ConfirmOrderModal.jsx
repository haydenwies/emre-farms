export default function ConfirmOrderModal({ order, otherClient, setShowConfirmOrder, onSubmit }) {
    
    return (
        <div className="modal-frame">
            <div className="confirm-order-modal">
                <button 
                    className="close" 
                    onClick={(e) => {
                        e.preventDefault();
                        setShowConfirmOrder(false);
                    }}
                >
                    close
                </button>
                <button
                    className="bold submit"
                    onClick={(e) => {
                        e.preventDefault();
                        onSubmit();
                    }}
                >
                    confirm submit
                </button>
                <div className="order-info">
                    {/* Client name */}
                    <h1>client: {otherClient ? otherClient : order.client}</h1>
                    {/* Delivery type + address */}
                    <p>
                        <span className="bold" >delivery type: </span>
                        <span>
                            {
                                order.deliveryType === "Delivery" ? 
                                `Delivery to ${order.deliveryAddress}` : 
                                `${order.deliveryType}`
                            }
                        </span>
                    </p>
                    {/* Due date */}
                    <p>
                        <span className="bold" >due date: </span>
                        <span>{order.dueDate}</span>
                    </p>
                    {/* List items... */}
                    <div className="items">
                        <p className="bold" >type</p>
                        <p className="bold" >size</p>
                        <p className="bold" >quantity</p>
                    </div>
                    {order.order.map(item => (
                        <div 
                            key={item.id} 
                            className="items"
                        >
                            <p>{item.size}</p>
                            <p>{item.type}</p>
                            <p>{item.quantity}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
