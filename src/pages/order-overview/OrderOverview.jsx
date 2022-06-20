import { useEffect, useReducer, useRef, useState } from 'react';
import { collection, deleteDoc, doc, onSnapshot, setDoc } from "firebase/firestore";
import { useReactToPrint } from 'react-to-print';

import { db } from '../../backend/config'
import { SizeOptions, TypeOptions } from '../../backend/tempSettings';

import Dropdown from '../../components/Dropdown';
import SortDropdown from './components/SortDropdown';
import { CircleRegular, CircleCheckSolid, TrashSolid } from '../../assets/Assets';
import { PrintTemplate } from './components/PrintTemplate';
import Nav from '../../components/Nav';

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
    UPDATE_ITEM: 'updateItem',
    DELETE_ITEM: 'deleteItem'
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
            return { isOpen: true, isEditing: false, changesMade: false, order: action.payload };
        case MODAL_ACTIONS.EDIT:
            return { isOpen: true, isEditing: true, changesMade: false, order: action.payload };
        case MODAL_ACTIONS.CLOSE:
            return { isOpen: false, isEditing: false, changesMade: false, order: action.payload };
        case MODAL_ACTIONS.UPDATE_ITEM:
            const updatedItemOrder = {
                client: modal.order.client,
                deliveryType: modal.order.deliveryType,
                id: modal.order.id,
                orderDate: modal.order.orderDate,
                order: modal.order.order.map(item => item.id === action.payload.id ? action.payload : item)
            };
            return { isOpen: true, isEditing: true, changesMade: true, order: updatedItemOrder };
        case MODAL_ACTIONS.DELETE_ITEM:
            const deletedItemOrder = {
                client: modal.order.client,
                deliveryType: modal.order.deliveryType,
                id: modal.order.id,
                orderDate: modal.order.orderDate,
                order: modal.order.order.filter(item => item.id !== action.payload.id)
            };
            return { isOpen: true, isEditing: true, changesMade: true, order: deletedItemOrder };
        default:
            return modal;
    };
};

export default function OrderOverview() {
    // For data management
    const [orders, dispatchOrders] = useReducer(ordersReducer, []);
    const [modal, dispatchModal] = useReducer(modalReducer, { isOpen: false, isEditing: false, changesMade: false, order: null });
    const [selectedOrders, setSelectedOrders] = useState([]);
    // For sorting fetched orders - change value to change default sort method
    const [sort, setSort] = useState("dueDate");
    // For printing
    const printRef = useRef();
    // For managing state on page
    const [deleteButtonText, setDeleteButtonText] = useState("delete")

    // ---------- Take order updated in modal and push changes to database ----------
    const onUpdate = async (order) => {
        const orderRef = doc(db, "orders-incomplete", order.id);
        setDoc(orderRef, order, { merge: true });
    };

    // ---------- Delete order from array ----------
    const onDelete = async (order) => {
        await deleteDoc(doc(db, "orders-incomplete", order.id));
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
    const isInSelectedOrders = (order) => {
        if (selectedOrders.filter(x => x.id === order.id).length > 0) {
            return true 
        } else {
            return false
        }
    }

    // When print button is tapped triggers react-to-print
    const handlePrint = useReactToPrint({
        content: () => printRef.current
    });

    // ---------- Attach listener on view mount ----------
    useEffect(() => {  
        const unsub = attachSnapshot();
        return () => {
            unsub();
        };
    }, []);

    return (
        <div className='order-overview'>
            {/* <Nav /> */}
            <div className="pannel">
                {/* ---------- Printing template ---------- */}
                <div className="print-template">
                    <PrintTemplate 
                        ref={printRef}
                        selectedOrders={selectedOrders}
                    />
                </div>
                {/* ---------- Modal ---------- */}
                {modal.isOpen && (
                    <div className="modal-frame">
                        <div className="modal">
                            <div className="modal-actions">
                                <div className="left">
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
                                            disabled={!modal.changesMade}
                                            className={modal.changesMade ? "" : "disabled"}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                onUpdate(modal.order)
                                                dispatchModal({ type: MODAL_ACTIONS.CLOSE, payload: null })
                                            }}
                                        >
                                            save
                                        </button>
                                    )}
                                    </div>
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (deleteButtonText === "delete") {
                                            setDeleteButtonText("confirm delete")
                                        } else {
                                            onDelete(modal.order);
                                            dispatchModal({ type: MODAL_ACTIONS.CLOSE, payload: null });
                                            setDeleteButtonText("delete")
                                        }
                                    }}
                                >
                                    {deleteButtonText}
                                </button>
                            </div>
                            <div className="modal-content">
                                <h1>Client: {modal.order.client}</h1>
                                <p>Delivery type: {modal.order.deliveryType}</p>
                                <p>Order date: {modal.order.orderDate} GMT</p>
                                <div className="order-item-list">
                                    {modal.order.order.map((item) => (
                                        <div 
                                            key={item.id}
                                            className={"order-item"}
                                        >
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
                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            dispatchModal({ 
                                                                type: MODAL_ACTIONS.DELETE_ITEM, 
                                                                payload: item })
                                                            }}
                                                    >
                                                        <img src={TrashSolid} alt="" />
                                                    </button>
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
                        </div>
                    </div>
                )}
                {/* ---------- Main view ---------- */}
                <div className="actions">
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            selectedOrders.length !== 0 ? setSelectedOrders([]) : setSelectedOrders(orders)
                        }}
                    >
                        {selectedOrders.length !== 0 ? "deselect all" : "select all"}
                    </button>
                    <div className="manage-actions">
                        <button
                            disabled={selectedOrders.length === 0}
                            className={selectedOrders.length > 0 ? "" : "disabled"}
                            onClick={(e) => {
                                e.preventDefault();
                                if (selectedOrders.length > 0) {
                                    handlePrint();
                                };
                            }}
                        >
                            print selected
                        </button>
                        <button
                            disabled={selectedOrders.length === 0}
                            className={selectedOrders.length > 0 ? "" : "disabled"}
                            onClick={(e) => {
                                e.preventDefault();
                                if (selectedOrders.length > 0) {
                                    for (const order of selectedOrders) {
                                        onDelete(order);
                                    };
                                };
                            }}
                        >
                            delete selected
                        </button> 
                    </div>
                </div>
                <SortDropdown 
                    value={sort}
                    setValue={setSort}
                    sortCallback = {(sortMethod) => {
                        dispatchOrders({ type: ORDER_DATA_ACTIONS.SORT, payload: sortMethod })
                    }}
                />
                <div className="labels">
                    <div></div>
                    <p className={"bold"}>client</p>
                    <p className={"bold"}>delivery type</p>
                    <p className={"bold"}>due date</p>
                    <div className="spacer"></div>
                </div>
                {orders.map((order) => (
                    <div 
                        key={order.id}
                        className={isInSelectedOrders(order) ? "order selected" : "order"}
                    >
                        <>
                            
                            <button
                                className={"select-button"}
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (isInSelectedOrders(order)) {
                                        setSelectedOrders(selectedOrders.filter(x => x.id !== order.id))
                                    } else {
                                        setSelectedOrders([...selectedOrders, order])
                                    }
                                }}
                            >
                                {isInSelectedOrders(order) && (
                                    <img src={CircleCheckSolid} alt="" />
                                )}
                                {!isInSelectedOrders(order) && (
                                    <img src={CircleRegular} alt="" />
                                )}
                            </button>
                            <div className="order-info">
                                <p>{order.client}</p>
                                <p>{order.deliveryType}</p>
                                <p>{order.dueDate}</p>
                            </div>
                        </>
                        <div className="order-actions">
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
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
