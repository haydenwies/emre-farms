import { useEffect, useReducer, useState } from 'react';
import { collection, doc, getDocs, setDoc } from "firebase/firestore"; 

import { db } from '../../backend/config'
import { datetimeString } from '../../utils/datetimeUtils';

import ItemCard from './components/ItemCard';
import ClientDropdown from './components/ClientDropdown';
import DeliveryTypeDropdown from './components/DeliveryTypeDropdown';
import { CirclePlusSolid } from '../../assets/Assets'
import AddClientModal from './components/AddClientModal';
import ConfirmOrderModal from './components/ConfirmOrderModal';

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
            return { client: order.client, deliveryType: order.deliveryType, deliveryAddress: order.deliveryAddress, dueDate: order.dueDate, order: [...order.order, { id: Date.now() }] };
        case ORDER_DATA_ACTIONS.MODIFY:
            return action.payload;
        case ORDER_DATA_ACTIONS.RESET:
            return { client: "", deliveryType: "", address: "", dueDate: "", order: [] };
        default:
            return order
    };
};

export default function OrderPlacement() {
    // Data
    const [order, dispatchOrder] = useReducer(ordersReducer, { client: "", deliveryType: "", deliveryAddress: "", dueDate: "", order: [] });
    // For client dropdown and setting preferred delivery type
    const [clients, setClients] = useState([]);
    const [clientOptions, setClientOptions] = useState([{ label: "Choose a client", value: "" }]);
    // Managing state of view components
    const [showAddClient, setShowAddClient] = useState(false); // Modal
    const [showConfirmOrder, setShowConfirmOrder] = useState(false); // Modal
    // const [buttonText, setButtonText] = useState("submit order");
    const [otherClient, setOtherClient] = useState("");

    const onSubmit = async (e) => {
        e.preventDefault();
        // Check if order is valid
        if (isValidOrder()) {
            if (!showConfirmOrder) {
                // Toggle button text on first click
                setShowConfirmOrder(true);
            } else {
                // On second click save to database, reset order and button text
                const timestamp = datetimeString();
                const docRef = doc(collection(db, "orders-incomplete"));
                const address = order.deliveryType === "Delivery" ? order.deliveryAddress : ""
                if (order.client === "other") {
                    await setDoc(docRef, {
                        client: otherClient,
                        deliveryType: order.deliveryType,
                        deliveryAddress: address,
                        dueDate: order.dueDate,
                        id: docRef.id,
                        order: order.order,
                        orderDate: timestamp
                    });
                } else {
                    await setDoc(docRef, {
                        client: order.client,
                        deliveryType: order.deliveryType,
                        deliveryAddress: address,
                        dueDate: order.dueDate,
                        id: docRef.id,
                        order: order.order,
                        orderDate: timestamp
                    });
                };
                dispatchOrder({ type: ORDER_DATA_ACTIONS.RESET });
                // setButtonText("submit order")
                setShowConfirmOrder(false)
                setOtherClient("");
            };
        } else {
            // Return error: order incomplete
            window.alert("Order incomplete, please fill in all fields.");
        };
    };

    const isValidOrder = () => {
        if (order.client !== "" &&
            order.deliveryType !== "" &&
            order.dueDate !== "" &&
            order.order.length > 0 &&
            order.order.filter(
                x => x.size === "" ||
                x.type === "" || 
                x.quantity === 0 ||
                x.size === undefined ||
                x.type === undefined || 
                x.quantity === undefined
            ).length === 0
        ) {
            if ((order.client === "other" && otherClient === "") ||
            (order.deliveryType === "Delivery" && order.deliveryAddress === "")) {
                return false
            } else {
                return true
            }
        } else {
            return false
        };
    };

    const isValidItems = () => {
        if (order.order.filter(
            x => x.size === "" ||
            x.type === "" || 
            x.quantity === 0 ||
            x.size === undefined ||
            x.type === undefined || 
            x.quantity === undefined
        ).length === 0) {
            return true
        } else {
            return false
        }
    }

    const getClients = async () => {
        const quereySnapshot = await getDocs(collection(db, "clients"));
        const newClients = [];
        quereySnapshot.forEach((doc) => {
            newClients.push(doc.data());
        });
        const newClientOptions = [{ label: "choose a client", value: "" }];
        for (const client of newClients) {
            newClientOptions.push({ label: client.name, value: client.name });
        };
        setClients(newClients);
        setClientOptions(newClientOptions);
    };

    useEffect(() => {
        getClients();
    }, []);

    return (
        
        <div className='order-placement'>
            <div className='pannel'>
                <div className="options">
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            dispatchOrder({ type: ORDER_DATA_ACTIONS.RESET })
                            // setButtonText("submit order")
                            setShowConfirmOrder(false);
                        }}
                    >
                        reset
                    </button>
                    <button
                            onClick={(e) => {
                                e.preventDefault();
                                setShowAddClient(true)
                            }}
                        >
                        add client
                    </button>
                </div>
                <div className="client-info">
                    <div className="client-dropdown">
                        <ClientDropdown 
                            className={"client-dropdown "}
                            value={order.client}
                            setValue={(client) => {
                                const selectedClient = clients.find(x => x.name === client)
                                // setButtonText("submit order")
                                setShowConfirmOrder(false);
                                // Throws error when re-selectcting "choose client" because no preferred delivery type
                                try {
                                    dispatchOrder({ type: ORDER_DATA_ACTIONS.MODIFY, 
                                        payload:  { client: client, deliveryType: selectedClient.preferredDeliveryType, deliveryAddress: selectedClient.preferredDeliveryAddress, dueDate: order.dueDate, order: order.order }
                                    })
                                } catch (err) {
                                    console.log(err);
                                }
                            }}
                            options={clientOptions}
                        />
                        {order.client === "other" && (
                            <input 
                            type="text" 
                            placeholder='other client name'
                            defaultValue={otherClient}
                            onChange={(e) => {
                                setOtherClient(e.target.value);
                            }}
                        />
                        )}
                    </div>
                    <div className="delivery-type-dropdown">
                        <DeliveryTypeDropdown 
                            value={order.deliveryType}
                            setValue={(deliveryType) => {
                                // setButtonText("submit order")
                                setShowConfirmOrder(false);
                                dispatchOrder({ 
                                    type: ORDER_DATA_ACTIONS.MODIFY,
                                    payload: { client: order.client, deliveryType: deliveryType, deliveryAddress: order.deliveryAddress, dueDate: order.dueDate, order: order.order }
                                })
                            }}
                        />
                        {order.deliveryType === "Delivery" && (                        
                            <input 
                                type="text" 
                                placeholder='address'
                                value={order.deliveryAddress}
                                onChange={(e) => {
                                    // setButtonText("submit order")
                                    setShowConfirmOrder(false);
                                    dispatchOrder({ 
                                        type: ORDER_DATA_ACTIONS.MODIFY,
                                        payload: { client: order.client, deliveryType: order.deliveryType, deliveryAddress: e.target.value, dueDate: order.dueDate, order: order.order }
                                    })
                                }}
                            />
                        )}
                    </div>
                    <div className="due-date">
                        due date:
                        <input 
                            type={"date"}
                            value={order.dueDate}
                            onChange={(e) => {
                                // setButtonText("submit order")
                                setShowConfirmOrder(false);
                                dispatchOrder({ 
                                    type: ORDER_DATA_ACTIONS.MODIFY,
                                    payload: { client: order.client, deliveryType: order.deliveryType, deliveryAddress: order.deliveryAddress, dueDate: e.target.value, order: order.order }
                                })
                            }}
                        />
                    </div>
                </div>
                
                {/* Item cards */}
                <div className={"item-list"}>
                    {order.order.map((item) => (
                        <div 
                            key={item.id}
                            className={"item"}
                        >
                            <ItemCard 
                                id={item.id}
                                order={order.order}
                                setOrder={(newOrder) => {
                                    // setButtonText("submit order")
                                    setShowConfirmOrder(false);
                                    dispatchOrder({ 
                                        type: ORDER_DATA_ACTIONS.MODIFY,
                                        payload: { client: order.client, deliveryType: order.deliveryType, deliveryAddress: order.deliveryAddress, dueDate: order.dueDate, order: newOrder }
                                    })
                                }}
                            />
                        </div>
                    ))}
                    <button
                        className={"add-button"}
                        onClick={(e) => {
                            e.preventDefault();
                            // setButtonText("submit order")
                            setShowConfirmOrder(false);
                            if (isValidItems()) {
                                dispatchOrder({ type: ORDER_DATA_ACTIONS.ADD })
                            } else {
                                window.alert("Fill in or delete incomplete item before adding another.")
                            }
                            
                        }}
                    >
                        <img src={CirclePlusSolid} alt="" />
                    </button>
                </div>
                {/* Save order */}
                <button
                    onClick={onSubmit}
                >
                    submit order
                </button>
                {showAddClient && (
                    <AddClientModal 
                        getClients={getClients}
                        setShowModal={setShowAddClient}
                    />
                )}
                {showConfirmOrder && (
                    <ConfirmOrderModal 
                        order={order}
                        otherClient={otherClient}
                        setShowConfirmOrder={setShowConfirmOrder}
                    />
                )}
            </div>
        </div>
    )
}
