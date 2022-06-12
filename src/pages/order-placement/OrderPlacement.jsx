import { useState } from 'react';
import { collection, doc, setDoc } from "firebase/firestore"; 

import { db } from '../../backend/config'
import { datetimeString } from '../../utils/datetimeUtils';

import ItemCard from './components/ItemCard';
import DeliveryTypeDropdown from './components/DeliveryTypeDropdown';

import './OrderPlacement.css';

export default function OrderPlacement() {
    // Order data
    const [client, setClient] = useState("");
    const [deliveryType, setDeliveryType] = useState("")
    const [order, setOrder] = useState([]);
    // Handling confirm button text
    const [buttonText, setButtonText] = useState("Submit order");

    const onChangeClient = (e) => {
        e.preventDefault();
        setClient(e.target.value);
    };

    const onAdd = (e) => {
        e.preventDefault();
        setOrder([...order, { id: Date.now() }]);
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        // Check if order is valid
        if (isValidOrder()) {
            if (buttonText === "Submit order") {
                // Toggle button text on first click
                setButtonText("Confirm");
            } else {
                // On second click save to database, reset order and button text
                const timestamp = datetimeString()
                const docRef = doc(collection(db, "orders-incomplete"));
                await setDoc(docRef, {
                    client: client,
                    deliveryType: deliveryType,
                    id: docRef.id,
                    orderDate: timestamp,
                    order
                });
                setOrder([]);
                setButtonText("Submit order")
            };
        } else {
            // Return error: order incomplete
            window.alert("Order incomplete, please fill in all fields.")
        };
    };

    const isValidOrder = () => {
        if (
            client !== "" &&
            deliveryType !== "" &&
            order.filter(
                x => x.size !== "" &&
                x.type !== "" && 
                x.quantity !== 0
            ).length > 0
        ) {
            return true
        } else {
            return false
        }
    }

    return (
        <div className='order-placement'>
            <div className='pannel'>
                
                <input 
                    type="text" 
                    placeholder="Client"
                    value={client}
                    onChange={onChangeClient}
                />
                <DeliveryTypeDropdown 
                    value={deliveryType}
                    setValue={setDeliveryType}
                />
                {/* Item cards */}
                <div>
                    {order.map((item) => (
                        <div key={item.id}>
                            <ItemCard 
                                id={item.id}
                                order={order}
                                setOrder={setOrder}
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
