import { useEffect, useReducer, useState } from 'react';
import { collection, doc, getDocs, setDoc } from "firebase/firestore"; 

import { db } from '../../backend/config'
import { datetimeString } from '../../utils/datetimeUtils';

import ItemCard from './components/ItemCard';
import ClientDropdown from './components/ClientDropdown';
import DeliveryTypeDropdown from './components/DeliveryTypeDropdown';

import './OrderPlacement.css';

const ORDER_DATA_ACTIONS = {
    ADD: "add",
    MODIFY: "modify",
    RESET: "reset"
};

const ordersReducer = (order, action) => {
    switch (action.type) {
        case ORDER_DATA_ACTIONS.ADD:
            // Add a new item to order
            return { client: order.client, deliveryType: order.deliveryType, dueDate: order.dueDate, order: [...order.order, { id: Date.now() }] };
        case ORDER_DATA_ACTIONS.MODIFY:
            return action.payload;
        case ORDER_DATA_ACTIONS.RESET:
            return { client: "", deliveryType: "", dueDate: "", order: [] };
        default:
            return order
    };
};

export default function OrderPlacement() {
    // Data
    const [order, dispatchOrder] = useReducer(ordersReducer, { client: {name: ""}, deliveryType: "", dueDate: "", order: [] });
    // For client dropdown and setting preferred delivery type
    const [clients, setClients] = useState([]);
    const [clientOptions, setClientOptions] = useState([{ label: "Choose a client", value: "" }]);
    // Managing state of view components
    const [buttonText, setButtonText] = useState("Submit order");

    const onSubmit = async (e) => {
        e.preventDefault();
        // Check if order is valid
        if (isValidOrder()) {
            if (buttonText === "Submit order") {
                // Toggle button text on first click
                setButtonText("Confirm");
            } else {
                // On second click save to database, reset order and button text
                const timestamp = datetimeString();
                const docRef = doc(collection(db, "orders-incomplete"));
                await setDoc(docRef, {
                    client: order.client,
                    deliveryType: order.deliveryType,
                    dueDate: order.dueDate,
                    id: docRef.id,
                    order: order.order,
                    orderDate: timestamp
                });
                dispatchOrder({ type: ORDER_DATA_ACTIONS.RESET });
            };
        } else {
            // Return error: order incomplete
            window.alert("Order incomplete, please fill in all fields.");
        };
    };

    const isValidOrder = () => {
        if (
            order.client !== "" &&
            order.deliveryType !== "" &&
            order.dueDate !== "" &&
            order.order.filter(
                x => x.size !== "" &&
                x.type !== "" && 
                x.quantity !== 0 &&
                x.size !== undefined &&
                x.type !== undefined && 
                x.quantity !== undefined
            ).length > 0
        ) {
            return true
        } else {
            return false
        };
    };

    useEffect(() => {
        const getClients = async () => {
            const quereySnapshot = await getDocs(collection(db, "clients"));
            const newClients = [];
            quereySnapshot.forEach((doc) => {
                if (newClients.filter(x => x.id === doc.id).length === 0) {
                    newClients.push(doc.data());
                };
            });
            const newClientOptions = [{ label: "Choose a client", value: "" }];
            for (const client of newClients) {
                newClientOptions.push({ label: client.name, value: client.name });
            };
            setClients(newClients);
            setClientOptions(newClientOptions);
        };
        getClients();
    }, []);

    return (
        <div className='order-placement'>
            <div className='pannel'>
                <ClientDropdown 
                    value={order.client}
                    setValue={(client) => {
                        const selectedClient = clients.find(x => x.name === client)
                        dispatchOrder({ type: ORDER_DATA_ACTIONS.MODIFY, 
                            payload:  { client: client, deliveryType: selectedClient.preferredDeliveryType, dueDate: order.dueDate, order: order.order }
                        })
                    }}
                    options={clientOptions}
                />
                <DeliveryTypeDropdown 
                    value={order.deliveryType}
                    setValue={(deliveryType) => {
                        dispatchOrder({ 
                            type: ORDER_DATA_ACTIONS.MODIFY,
                            payload: { client: order.client, deliveryType: deliveryType, dueDate: order.dueDate, order: order.order }
                        })
                    }}
                />
                <input 
                    type={"date"}
                    defaultValue={order.dueDate}
                    onChange={(e) => {
                        dispatchOrder({ 
                            type: ORDER_DATA_ACTIONS.MODIFY,
                            payload: { client: order.client, deliveryType: order.deliveryType, dueDate: e.target.value, order: order.order }
                        })
                    }}
                />
                {/* Item cards */}
                <div>
                    {order.order.map((item) => (
                        <div key={item.id}>
                            <ItemCard 
                                id={item.id}
                                order={order.order}
                                setOrder={(newOrder) => {
                                    dispatchOrder({ 
                                        type: ORDER_DATA_ACTIONS.MODIFY,
                                        payload: { client: order.client, deliveryType: order.deliveryType, dueDate: order.dueDate, order: newOrder }
                                    })
                                }}
                            />
                        </div>
                    ))}
                </div>
                {/* New item */}
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        dispatchOrder({ type: ORDER_DATA_ACTIONS.ADD })
                    }}
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
