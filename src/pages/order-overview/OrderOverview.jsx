import { useEffect, useReducer, useRef, useState } from 'react';
import { collection, deleteDoc, doc, onSnapshot, setDoc } from "firebase/firestore";
import { useReactToPrint } from 'react-to-print';

import { db } from '../../backend/config'
import { SizeOptions, TypeOptions } from '../../backend/tempSettings';

import Dropdown from '../../components/Dropdown';
import SortDropdown from './components/SortDropdown';
import { CircleRegular, CircleCheckSolid } from '../../assets/Assets';
import { PrintTemplate } from './components/PrintTemplate';

import './OrderOverview.css';

const ORDER_DATA_ACTIONS = {
    ADD: "add",
    MODIFY: "modify",
    REMOVE: "remove",
    SORT: "sort"
};

const MODAL_ACTIONS = {
    VIEW: 'view',
    EDIT: 'edit',
    CLOSE: 'close',
    UPDATE_ITEM: 'updateItem'
};

const ordersReducer = (orders, action) => { 
    switch (action.type) {
        case ORDER_DATA_ACTIONS.ADD: 
            return [...orders, action.payload ];
        case ORDER_DATA_ACTIONS.MODIFY:
            return orders.map(order => order.id === action.payload.id ? action.payload : order);
        case ORDER_DATA_ACTIONS.REMOVE:
            return orders.filter(order => order.id !== action.payload.id);
        case ORDER_DATA_ACTIONS.SORT:
            return orders.sort((a, b) => {
                return (a[action.payload] > b[action.payload]) ? 1 : ((a[action.payload] < b[action.payload]) ? -1 : 0);
            })
        default:
            return orders;
    };
};

const modalReducer = (modal, action) => {
    switch (action.type){
        case MODAL_ACTIONS.VIEW:
            return { isOpen: true, isEditing: false, order: action.payload };
        case MODAL_ACTIONS.EDIT:
            return { isOpen: true, isEditing: true, order: action.payload };
        case MODAL_ACTIONS.CLOSE:
            return { isOpen: false, isEditing: false, order: action.payload };
        case MODAL_ACTIONS.UPDATE_ITEM:
            const newOrder = {
                client: modal.order.client,
                deliveryType: modal.order.deliveryType,
                id: modal.order.id,
                orderDate: modal.order.orderDate,
                order: modal.order.order.map(item => item.id === action.payload.id ? action.payload : item)
            };
            return { isOpen: true, isEditing: true, order: newOrder };
        default:
            return modal;
    };
};

export default function OrderOverview() {
    // For data management
    const [orders, dispatchOrders] = useReducer(ordersReducer, []);
    const [modal, dispatchModal] = useReducer(modalReducer, { isOpen: false, isEditing: false, order: null });
    // For sorting fetched orders - change value to change default sort method
    const [sort, setSort] = useState("dueDate");
    // Printing data
    const printRef = useRef();
    const [printQueue, setPrintQueue] = useState([]);

    // ---------- Take order updated in modal and push changes to database ----------
    const onUpdate = async (order) => {
        const orderRef = doc(db, "orders-incomplete", order.id);
        setDoc(orderRef, order, { merge: true });
    };

    // ---------- Delete order from array ----------
    const onDelete = async (order) => {
        await deleteDoc(doc(db, "orders-incomplete", order.id))
    };

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
                        dispatchOrders({ type: ORDER_DATA_ACTIONS.ADD, payload: change.doc.data() });
                    };
                } else if (change.type === "modified") {
                    dispatchOrders({ type: ORDER_DATA_ACTIONS.MODIFY, payload: change.doc.data() })
                } else if (change.type === "removed") {
                    dispatchOrders({ type: ORDER_DATA_ACTIONS.REMOVE, payload: change.doc.data() })
                }
            });
            dispatchOrders({ type: ORDER_DATA_ACTIONS.SORT, payload: sort });
        });
        return unsub;
    }

    // ---------- Determine if order exists in print queue ----------
    const isInPrintQueue = (order) => {
        if (printQueue.filter(x => x.id === order.id).length > 0) {
            return true 
        } else {
            return false
        }
    }

    const handlePrint = useReactToPrint({
        content: () => printRef.current
    });

    // ---------- Attach listener on view mount ----------
    useEffect(() => {  
        console.log("run");
        const unsub = attachSnapshot();
        return () => {
            unsub();
        };
    }, []);

    return (
        <div className='order-overview'>
            {/* ---------- Printing template ---------- */}
            <div className="print-template">
                <PrintTemplate 
                    ref={printRef}
                    printQueue={printQueue}
                />
            </div>
            {/* ---------- Modal ---------- */}
            {modal.isOpen && (
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
            {/* ---------- Main view ---------- */}
            <button
                onClick={(e) => {
                    e.preventDefault();
                    printQueue.length !== 0 ? setPrintQueue([]) : setPrintQueue(orders)
                }}
            >
                {printQueue.length !== 0 ? "deselect all" : "select all"}
            </button>
            <button
                onClick={(e) => {
                    e.preventDefault();
                    if (printQueue.length > 0) {
                        handlePrint();
                    };
                }}
            >
                print
            </button>
            <SortDropdown 
                value={sort}
                setValue={setSort}
                sortCallback = {(sortMethod) => {
                    dispatchOrders({ type: ORDER_DATA_ACTIONS.SORT, payload: sortMethod })
                }}
            />
            {orders.map((order) => (
                <div key={order.id}>
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            if (isInPrintQueue(order)) {
                                setPrintQueue(printQueue.filter(x => x.id !== order.id))
                            } else {
                                setPrintQueue([...printQueue, order])
                            }
                        }}
                    >
                        {isInPrintQueue(order) && (
                            <img src={CircleCheckSolid} alt="" />
                        )}
                        {!isInPrintQueue(order) && (
                            <img src={CircleRegular} alt="" />
                        )}
                    </button>
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
    )
}
