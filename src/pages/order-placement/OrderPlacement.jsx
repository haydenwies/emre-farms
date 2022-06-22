import { useEffect, useReducer, useState } from 'react';
import { collection, doc, getDocs, setDoc } from "firebase/firestore"; 

import { db } from '../../backend/config'
import { datetimeString } from '../../utils/datetimeUtils';

import ItemCard from './components/ItemCard';
import ClientDropdown from './components/ClientDropdown';
import DeliveryTypeDropdown from './components/DeliveryTypeDropdown';
import { CirclePlusSolid } from '../../assets/Assets'

import './OrderPlacement.css';
import AddClientModal from './components/AddClientModal';

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
    const [order, dispatchOrder] = useReducer(ordersReducer, { client: "", deliveryType: "", dueDate: "", order: [] });
    // For client dropdown and setting preferred delivery type
    const [clients, setClients] = useState([]);
    const [clientOptions, setClientOptions] = useState([{ label: "Choose a client", value: "" }]);
    // Managing state of view components
    const [buttonText, setButtonText] = useState("submit order");
    const [showModal, setShowModal] = useState(false);
    const [otherClient, setOtherClient] = useState("");

    const onSubmit = async (e) => {
        e.preventDefault();
        // Check if order is valid
        if (isValidOrder()) {
            if (buttonText === "submit order") {
                // Toggle button text on first click
                setButtonText("confirm submit");
            } else {
                // On second click save to database, reset order and button text
                const timestamp = datetimeString();
                const docRef = doc(collection(db, "orders-incomplete"));
                if (order.client === "other") {
                    await setDoc(docRef, {
                        client: otherClient,
                        deliveryType: order.deliveryType,
                        dueDate: order.dueDate,
                        id: docRef.id,
                        order: order.order,
                        orderDate: timestamp
                    });
                } else {
                    await setDoc(docRef, {
                        client: order.client,
                        deliveryType: order.deliveryType,
                        dueDate: order.dueDate,
                        id: docRef.id,
                        order: order.order,
                        orderDate: timestamp
                    });
                };
                dispatchOrder({ type: ORDER_DATA_ACTIONS.RESET });
                setButtonText("submit order")
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
            return true
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
                            setButtonText("submit order")
                        }}
                    >
                        reset
                    </button>
                    <button
                            onClick={(e) => {
                                e.preventDefault();
                                setShowModal(true)
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
                                setButtonText("submit order")
                                // Throws error when re-selectcting "choose client" because no preferred delivery type
                                try {
                                    dispatchOrder({ type: ORDER_DATA_ACTIONS.MODIFY, 
                                        payload:  { client: client, deliveryType: selectedClient.preferredDeliveryType, dueDate: order.dueDate, order: order.order }
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
                                setButtonText("submit order")
                                dispatchOrder({ 
                                    type: ORDER_DATA_ACTIONS.MODIFY,
                                    payload: { client: order.client, deliveryType: deliveryType, dueDate: order.dueDate, order: order.order }
                                })
                            }}
                        />
                        
                        <input 
                            type="text" 
                            placeholder='address'
                        />
                    </div>
                    <div className="due-date">
                        due date:
                        <input 
                            type={"date"}
                            value={order.dueDate}
                            onChange={(e) => {
                                setButtonText("submit order")
                                dispatchOrder({ 
                                    type: ORDER_DATA_ACTIONS.MODIFY,
                                    payload: { client: order.client, deliveryType: order.deliveryType, dueDate: e.target.value, order: order.order }
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
                                    setButtonText("submit order")
                                    dispatchOrder({ 
                                        type: ORDER_DATA_ACTIONS.MODIFY,
                                        payload: { client: order.client, deliveryType: order.deliveryType, dueDate: order.dueDate, order: newOrder }
                                    })
                                }}
                            />
                        </div>
                    ))}
                    <button
                        className={"add-button"}
                        onClick={(e) => {
                            e.preventDefault();
                            setButtonText("submit order")
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
                    {buttonText}
                </button>
                {showModal && (
                    <AddClientModal 
                        getClients={getClients}
                        setShowModal={setShowModal}
                    />
                )}
            </div>
        </div>
    )
}
