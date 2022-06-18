import { forwardRef } from "react"

export const PrintTemplate = forwardRef(({ selectedOrders }, ref) => (

    <div ref={ref}>
        {selectedOrders.map(order => (
            <div key={order.id}>
                <p>{order.client}</p>
            </div>
        ))}
    </div>
));