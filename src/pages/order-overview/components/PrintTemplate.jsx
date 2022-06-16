import { forwardRef } from "react"

export const PrintTemplate = forwardRef(({ printQueue }, ref) => (

    <div ref={ref}>
        {printQueue.map(order => (
            <div key={order.id}>
                <p>{order.client}</p>
            </div>
        ))}
    </div>
));