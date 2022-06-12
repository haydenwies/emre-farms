import { useEffect, useReducer, useState } from 'react';
import { collection, deleteDoc, doc, onSnapshot, setDoc } from "firebase/firestore";

import { db } from '../../backend/config'
import { SizeOptions, TypeOptions } from '../../backend/tempSettings';

import Dropdown from '../../components/Dropdown';
import SortDropdown from './components/SortDropdown';

import './OrderOverview.css'

const ORDER_DATA_ACTIONS = {
    ADD_ORDER: "add",
    MODIFY_ORDER: "modify",
    REMOVE_ORDER: "remove",
    SORT_ORDER: "sort"
}

const MODAL_ACTIONS = {
    VIEW: 'view',
    EDIT: 'edit',
    CLOSE: 'close',
    UPDATE_ITEM: 'updateItem'
}

const ordersReducer = (orders, action) => { 
    switch (action.type) {
        case ORDER_DATA_ACTIONS.ADD_ORDER: 
            return [...orders, action.payload ]
        case ORDER_DATA_ACTIONS.MODIFY_ORDER:
            return orders.map(order => order.id === action.payload.id ? action.payload : order)
        case ORDER_DATA_ACTIONS.REMOVE_ORDER:
            return orders.filter(order => order.id !== action.payload.id)
        // case ORDER_DATA_ACTIONS.SORT_ORDER:
        //     return action.payload
        default:
            return orders
    }
}

const modalReducer = (modal, action) => {
    switch (action.type){
        case MODAL_ACTIONS.VIEW:
            return { show: true, isEditing: false, order: action.payload }
        case MODAL_ACTIONS.EDIT:
            return { show: true, isEditing: true, order: action.payload }
        case MODAL_ACTIONS.CLOSE:
            return { show: false, isEditing: false, order: action.payload }
        case MODAL_ACTIONS.UPDATE_ITEM:
            const newOrder = {
                client: modal.order.client,
                deliveryType: modal.order.deliveryType,
                id: modal.order.id,
                orderDate: modal.order.orderDate,
                order: modal.order.order.map(item => item.id === action.payload.id ? action.payload : item)
            }
            return { show: true, isEditing: true, order: newOrder }
        default:
            return modal 
    }
}

export default function OrderOverview() {
    // For data management
    const [orders, dispatchOrders] = useReducer(ordersReducer, [])
    const [modal, dispatchModal] = useReducer(modalReducer, { show: false, isEditing: false, order: null })
    // For sorting fetched orders
    const [sort, setSort] = useState("date-ascending");


    // ---------- Take order updated in modal and push changes to database ----------
    const onUpdate = async (order) => {
        const orderRef = doc(db, "orders-incomplete", order.id)
        setDoc(orderRef, order, { merge: true })
    }

    // ---------- Delete order from array ----------
    const onDelete = async (order) => {
        await deleteDoc(doc(db, "orders", order.id))
    }

    // ---------- Listener to attach to orders-incomplete ----------
    const attachSnapshot = () => {
        // ---------- Compare order to array of orders and check if it already exists ----------
        const isInArray = (order) => {
            if (orders.filter(x => x.id === order.id).length > 0) {
                return true
            } else {
                return false
            } 
        }
        const unsub = onSnapshot(collection(db, "orders-incomplete"), (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === "added") {
                    if (!isInArray(change.doc.data())) {
                        dispatchOrders({ type: ORDER_DATA_ACTIONS.ADD_ORDER, payload: change.doc.data() })
                    }
                }
                if (change.type === "modified") {
                    console.log("here");
                    dispatchOrders({ type: ORDER_DATA_ACTIONS.MODIFY_ORDER, payload: change.doc.data() })
                }
                if (change.type === "removed") {
                    dispatchOrders({ type: ORDER_DATA_ACTIONS.REMOVE_ORDER, payload: change.doc.data() })
                }
            });
        });
        return unsub
    };

    // ---------- Attach listener on view mount ----------
    useEffect(() => {  
        const unsub = attachSnapshot();
        return () => {
            unsub();
        };
    }, []);

    return (
        <div className='order-overview'>
            <div className="pannel">
                {modal.show && (
                    <div className="modal-frame">
                        <div className="modal">
                            <button 
                                onClick={(e) => {
                                    e.preventDefault();
                                    dispatchModal({ type: MODAL_ACTIONS.CLOSE, payload: null });
                                }}
                            >
                                close
                            </button>
                            {modal.isEditing && (
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        onUpdate(modal.order)
                                        dispatchModal({ type: MODAL_ACTIONS.CLOSE, payload: null })
                                    }}
                                >
                                    save
                                </button>
                            )}
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    onDelete(modal.order);
                                    dispatchModal({ type: MODAL_ACTIONS.CLOSE, payload: null });
                                }}
                            >
                                delete
                            </button>
                            <h1>Client: {modal.order.client}</h1>
                            <h2>Delivery type: {modal.order.deliveryType}</h2>
                            <p>Order date: {modal.order.orderDate}</p>
                            {modal.order.order.map((item) => (
                                <div key={item.id}>
                                    {modal.isEditing && (
                                        <>
                                            <Dropdown 
                                                label={""}
                                                options={SizeOptions}
                                                value={item.size}
                                                onChange={(e) => {
                                                    dispatchModal({ 
                                                        type: MODAL_ACTIONS.UPDATE_ITEM,
                                                        payload: {
                                                            id: item.id, 
                                                            size: e.target.value, 
                                                            type: item.type, 
                                                            quantity: item.quantity
                                                        } 
                                                    })
                                                }}
                                            />
                                            <Dropdown 
                                                label={""}
                                                options={TypeOptions}
                                                value={item.type}
                                                onChange={(e) => {
                                                    dispatchModal({ 
                                                        type: MODAL_ACTIONS.UPDATE_ITEM,
                                                        payload: {
                                                            id: item.id, 
                                                            size: item.size, 
                                                            type: e.target.value, 
                                                            quantity: item.quantity
                                                        } 
                                                    })
                                                }}
                                            />
                                            <input 
                                                type="number"
                                                defaultValue={item.quantity}
                                                placeholder={0}
                                                min={1}
                                                onChange={(e) => {
                                                    dispatchModal({ 
                                                        type: MODAL_ACTIONS.UPDATE_ITEM,
                                                        payload: {
                                                            id: item.id, 
                                                            size: item.size, 
                                                            type: item.type, 
                                                            quantity: e.target.value
                                                        } 
                                                    })
                                                }}
                                            />
                                        </>
                                    )}
                                    {!modal.isEditing && (
                                        <>
                                            <p>{item.size}</p>
                                            <p>{item.type}</p>
                                            <p>{item.quantity}</p>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                <div className="sort-dropdown">
                    <SortDropdown 
                        value={sort}
                        setValue={setSort}
                    />
                </div>
                <div className="labels">
                    <p>customer:</p>
                    <p>delivery type:</p>
                    <p>order size:</p>
                </div>
                {orders.map((order) => (
                    <div key={order.id}>
                        <p>{order.client}</p>
                        <p>{order.deliveryType}</p>
                        <p>{order.quantity}</p>
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                dispatchModal({ type: MODAL_ACTIONS.VIEW, payload: order})
                            }}  
                        >
                            view
                        </button>
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                dispatchModal({ type: MODAL_ACTIONS.EDIT, payload: order })
                            }}
                        >
                            edit
                        </button>
                        <button 
                            onClick={(e) => {
                                e.preventDefault()
                                onDelete(order)
                            }}
                        >
                            delete
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}
