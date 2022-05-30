import { useState } from 'react';

import ItemCard from './components/ItemCard';
import DeliveryTypeDropdown from './components/DeliveryTypeDropdown';

import './OrderPlacement.css';

export default function OrderPlacement() {
    // Order data
    const [client, setClient] = useState("");
    const [order, setOrder] = useState([]);
    // Handling confirm button text
    const [buttonText, setButtonText] = useState("Submit order");

    const onChangeClient = (e) => {
        e.preventDefault();
        setClient(e.target.value);
    }

    const onAdd = (e) => {
        e.preventDefault();
        setOrder([...order, {size: "n/a", type: "n/a", quantity: 1}])
    }

    const onSubmit = (e) => {
        e.preventDefault();
        if (buttonText === "Submit order") {
            setButtonText("Confirm")
        } else {
            setButtonText("Submit order")
        }
    };

    return (
        <div className='order-placement'>
            <div className='pannel'>
                
                <input 
                    type="text" 
                    placeholder="Client"
                    value={client}
                    onChange={onChangeClient}
                />
                <DeliveryTypeDropdown />
                {/* Item cards */}
                <div>
                    {order.map((item) => (
                        <div key={order.indexOf(item)}>
                            <ItemCard 
                                itemSize={item.size}
                                itemType={item.type}
                                itemQuantity={item.quantity}
                            />
                        </div>
                    ))}
                </div>
                {/* New item */}
                <button
                    onClick={onAdd}
                >
                    Add item
                </button>
                {/* Save order */}
                <button
                    onClick={onSubmit}
                >
                    {buttonText}
                </button>
                
            </div>
        </div>
    )
}
