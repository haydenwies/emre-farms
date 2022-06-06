import { useEffect, useReducer } from 'react';
import { collection, deleteDoc, doc, onSnapshot, setDoc } from "firebase/firestore";

import { db } from '../../backend/config'
import { SizeOptions, TypeOptions } from '../../backend/tempSettings';

import Dropdown from '../../components/Dropdown';
import SortDropdown from './components/SortDropdown';

import './OrderOverview.css'

const LISTENER_ACTIONS = {
    ADD_ORDER: "addOrder",
    MODIFY_ORDER: "modifyOrder",
    REMOVE_ORDER: "removeOrder"
}

const MODAL_ACTIONS = {
    VIEW: 'view',
    EDIT: 'edit',
    CLOSE: 'close',
    UPDATE_ITEM: 'updateItem'
}

const ordersReducer = (orders, action) => { 
    switch (action.type) {
        case LISTENER_ACTIONS.ADD_ORDER: 
            return [...orders, action.payload ]
        case LISTENER_ACTIONS.MODIFY_ORDER:
            return orders.map(order => order.id === action.payload.id ? action.payload : order)
        case LISTENER_ACTIONS.REMOVE_ORDER:
            return orders.filter(order => order.id !== action.payload.id)
        default:
            return orders
    }
}

const modalReducer = (modal, action) => {
    switch (action.type){
        case MODAL_ACTIONS.VIEW:
            return { show: true, isEditing: false, order: action.payload }
        case MODAL_ACTIONS.EDIT:
            console.log(action.payload);
            return { show: true, isEditing: true, order: action.payload }
        case MODAL_ACTIONS.CLOSE:
            return { show: false, isEditing: false, order: action.payload }
        case MODAL_ACTIONS.UPDATE_ITEM:
            const newOrder = {
                client: modal.order.client,
                deliveryType: modal.order.deliveryType,
                id: modal.order.id,
                order: modal.order.order.map(item => item.id === action.payload.id ? action.payload : item)
            }
            return { show: true, isEditing: true, order: newOrder }
        default:
            return modal 
    }
}

export default function OrderOverview() {
    const [orders, dispatchOrders] = useReducer(ordersReducer, [])
    const [modal, dispatchModal] = useReducer(modalReducer, { show: false, isEditing: false, order: null })

    const onUpdate = async (order) => {
        const orderRef = doc(db, "orders", order.id)
        setDoc(orderRef, order, { merge: true })
    }

    const onDelete = async (order) => {
        await deleteDoc(doc(db, "orders", order.id))
    }

    useEffect(() => {

        const unsub = onSnapshot(collection(db, "orders"), (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === "added") {
                    dispatchOrders({ type: LISTENER_ACTIONS.ADD_ORDER, payload: change.doc.data() })
                }
                if (change.type === "modified") {
                    dispatchOrders({ type: LISTENER_ACTIONS.MODIFY_ORDER, payload: change.doc.data() })
                }
                if (change.type === "removed") {
                    dispatchOrders({ type: LISTENER_ACTIONS.REMOVE_ORDER, payload: change.doc.data() })
                }
            });
        });

        return () => {
            unsub()
        }

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
                    <SortDropdown />
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
