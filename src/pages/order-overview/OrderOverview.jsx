import SortDropdown from './components/SortDropdown'

import './OrderOverview.css'

export default function OrderOverview() {
    const orderList = [
        {customer: "customer", deliveryType: "delivery-type", quantity: 20},
        {customer: "customer", deliveryType: "delivery-type", quantity: 20},
        {customer: "customer", deliveryType: "delivery-type", quantity: 20},
        {customer: "customer", deliveryType: "delivery-type", quantity: 20}
    ]

    return (
        <div className='order-overview'>
            <div className="pannel">
                <div className="sorting">
                    <SortDropdown />
                </div>
                <div className="labels">
                    <p>customer:</p>
                    <p>delivery type:</p>
                    <p>order size:</p>
                </div>
                {orderList.map((order) => (
                    <div>
                        <p>{order.customer}</p>
                        <p>{order.deliveryType}</p>
                        <p>{order.quantity}</p>
                        <button>view</button>
                        <button>edit</button>
                        <button>delete</button>
                    </div>
                ))}
            </div>
        </div>
    )
}
