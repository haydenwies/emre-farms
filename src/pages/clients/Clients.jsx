import { useEffect, useReducer, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { collection, deleteDoc, doc, onSnapshot, setDoc } from "firebase/firestore";

import { db } from '../../backend/config';
import { useAuthContext } from '../../hooks/useAuthContext';

import DeliveryTypeDropdown from './components/DeliveryTypeDropdown';
import SortDropdown from './components/SortDropdown';

import './Clients.css';

const CLIENT_DATA_ACTIONS = {
    ADD: "add",
    MODIFY: "edit",
    REMOVE: "remove",
    SORT: "sort"
};

const SELECTED_CLIENT_ACTIONS = {
    ADD: "add",
    SELECT: "select",
    MODIFY: "modify",
    CLOSE: "close"
};

const clientsReducer = (clients, action) => {
    switch (action.type) {
        case CLIENT_DATA_ACTIONS.ADD:
            return [...clients, action.payload];
        case CLIENT_DATA_ACTIONS.MODIFY:
            return clients.map(client => client.id === action.payload.id ? action.payload : client);
        case CLIENT_DATA_ACTIONS.REMOVE:
            return clients.filter(client => client.id !== action.payload.id);
        case CLIENT_DATA_ACTIONS.SORT:
            return clients.sort((a, b) => {
                return (a[action.payload] > b[action.payload]) ? 1 : ((a[action.payload] < b[action.payload]) ? -1 : 0)
            })
        default:
            return clients;
    };
};

const selectedReducer = (selectedClient, action) => {
    switch (action.type) {
        // Used when adding new client into the system
        case SELECTED_CLIENT_ACTIONS.ADD:
            return { 
                isOpen: true, 
                isEditing: true, 
                client: { name: "", preferredDeliveryAddress: "", preferredDeliveryType: "" } 
            };
        // Used when client from list is selected - opens selected view
        case SELECTED_CLIENT_ACTIONS.SELECT:
            return { isOpen: true, isEditing: false, client: action.payload };
        // Used every time an attribute is changed in a new or existing client
        case SELECTED_CLIENT_ACTIONS.MODIFY:
            return { isOpen: true, isEditing: true, client: action.payload };
        case SELECTED_CLIENT_ACTIONS.CLOSE:
            return { isOpen: false, isEditing: false, client: null };
        default: 
            return selectedClient;
    };
};

export default function Customers() {
    // For data management
    const [clients, dispatchClients] = useReducer(clientsReducer, []);
    const [selected, dispatchSelected] = useReducer(selectedReducer, {isOpen: false, isEditing: false, client: null});
    // For sorting fetched clients - change value to change default sort method
    const [sort, setSort] = useState("name");
    // For managing state of components on page
    const [buttonText, setButtonText] = useState("delete");

    const { userType } = useAuthContext();

    // ---------- Add new customer to database ----------
    const onSave = async () => {
        if (selected.client.name.toLowerCase() !== "other") {
            if (selected.client.id) {
                // Client already has ID meaning they already exist and doc should be updated not created in database
                const docRef = doc(db, "clients", selected.client.id);
                setDoc(docRef, selected.client, { merge: true });
                dispatchSelected({ type: SELECTED_CLIENT_ACTIONS.SELECT, payload: selected.client });
            } else {
                // Client doesn't have ID meainig they don't exist and doc should be created in backend
                if (selected.client.name && selected.client.preferredDeliveryType) {           
                    const docRef = doc(collection(db, "clients"));
                    await setDoc(docRef, {
                        name: selected.client.name,
                        id: docRef.id,
                        preferredDeliveryAddress: selected.client.preferredDeliveryAddress,
                        preferredDeliveryType: selected.client.preferredDeliveryType
                    });
                    dispatchSelected({ type: SELECTED_CLIENT_ACTIONS.CLOSE });
                } else {
                    window.alert("Please fill in all fields before saving a new client.");
                };
            };
        } else {
            window.alert("Cannot name client 'other'.")
        };
    };

    // ---------- Delete customer from database ----------
    const onDelete = async () => {
        if (selected.client.id) {
            // If client already in database, delete
            await deleteDoc(doc(db, "clients", selected.client.id));
        } 
        // If client hasn't yet been saved to database (was just created), close and clear data
        dispatchSelected({ type: SELECTED_CLIENT_ACTIONS.CLOSE });
    };

    // ---------- Listener to attach to clients ----------
    const attachSnapshot = () => {
        // ---------- Compare client to array of clients and check if it already exists ----------
        const isInArray = (client) => {
            if (clients.filter(x => x.id === client.id).length > 0) {
                return true;
            } else {
                if (client.name !== "other") {
                    return false;
                } else {
                    return true
                };
            };
        };
        const unsub = onSnapshot(collection(db, "clients"), (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === "added") {
                    if (!isInArray(change.doc.data())) {
                        dispatchClients({ type: CLIENT_DATA_ACTIONS.ADD, payload: change.doc.data() });
                    };
                } else if (change.type === "modified") {
                    dispatchClients({ type: CLIENT_DATA_ACTIONS.MODIFY, payload: change.doc.data() });
                } else if (change.type === "removed") {
                    dispatchClients({ type: CLIENT_DATA_ACTIONS.REMOVE, payload: change.doc.data() });
                };
            });
            dispatchClients({ type: CLIENT_DATA_ACTIONS.SORT, payload: sort })
        });
        return unsub;
    };

    useEffect(() => {
        const unsub = attachSnapshot();
        return () => {
            unsub();
        };
    }, []);

    if (userType !== "admin") {
        return <Navigate to={"/"} />
    } else {
        return (
            <div className='clients'>
                {/* <Nav /> */}
                <div className="pannel">
                    <div className="options-view">
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                dispatchSelected({ type: SELECTED_CLIENT_ACTIONS.ADD })
                            }}
                        >
                            add
                        </button>
                        <SortDropdown 
                            value={sort}
                            setValue={setSort}
                            sortCallback={(sortMethod) => {
                                dispatchClients({ type: CLIENT_DATA_ACTIONS.SORT, payload: sortMethod })
                            }}
                        />
                        <div className="client-list">
                            {clients.map((client) => (
                                <div 
                                    key={client.id}
                                    onClick={() => {
                                        dispatchSelected({ type: SELECTED_CLIENT_ACTIONS.SELECT, payload: client })}
                                    }
                                >
                                    <p>{client.name}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* ---------- Selected client ---------- */}
                    {selected.isOpen && (
                        <div className="selection-view">
                            {selected.isEditing && (
                                <div className="client-pannel">
                                    <div className="actions">
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                dispatchSelected({ type: SELECTED_CLIENT_ACTIONS.CLOSE });
                                                setButtonText("delete")
                                            }}
                                        >
                                            close
                                        </button>
                                        <div className="actions-more">
                                            <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                onSave();
                                                setButtonText("delete")
                                            }}
                                            >
                                                save    
                                            </button> 
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    if (selected.client.id) {
                                                        if (buttonText === "delete") {
                                                            setButtonText("confirm delete")
                                                        } else {
                                                            onDelete();
                                                            setButtonText("delete")
                                                        }
                                                    } else {
                                                        dispatchSelected({ type: SELECTED_CLIENT_ACTIONS.CLOSE })
                                                    }
                                                }}
                                            >
                                                {selected.client.id ? buttonText : "cancel"}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="info">
                                        <input 
                                            type="text" 
                                            value={selected.client.name}
                                            placeholder={"client name"}
                                            onChange={(e) => {
                                                dispatchSelected({
                                                    type: SELECTED_CLIENT_ACTIONS.MODIFY,
                                                    payload: { 
                                                        name: e.target.value, 
                                                        id: selected.client.id, 
                                                        preferredDeliveryAddress: selected.client.preferredDeliveryAddress,
                                                        preferredDeliveryType: selected.client.preferredDeliveryType
                                                    }
                                                });
                                            }}
                                        />
                                        <div className="delivery">
                                            <DeliveryTypeDropdown 
                                                value={selected.client.preferredDeliveryType}
                                                setValue={(value) => {
                                                    dispatchSelected({ 
                                                        type: SELECTED_CLIENT_ACTIONS.MODIFY,
                                                        payload: {
                                                            name: selected.client.name,
                                                            id: selected.client.id,
                                                            preferredDeliveryAddress: selected.client.preferredDeliveryAddress,
                                                            preferredDeliveryType: value
                                                        }
                                                    });
                                                }}
                                            />  
                                            {selected.client.preferredDeliveryType === "Delivery" && (
                                                <input 
                                                    type="text" 
                                                    placeholder="Preferred delivery address"
                                                    value={selected.client.preferredDeliveryAddress}
                                                    onChange={(e) => {
                                                        dispatchSelected({
                                                            type: SELECTED_CLIENT_ACTIONS.MODIFY,
                                                            payload: { 
                                                                name: selected.client.name, 
                                                                id: selected.client.id, 
                                                                preferredDeliveryAddress: e.target.value,
                                                                preferredDeliveryType: selected.client.preferredDeliveryType
                                                            }
                                                        });
                                                    }}
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                            {!selected.isEditing && (
                                <div className="client-pannel">
                                    <div className="actions">
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                dispatchSelected({ type: SELECTED_CLIENT_ACTIONS.CLOSE });
                                                setButtonText("delete")
                                            }}
                                        >
                                            close
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                dispatchSelected({ type: SELECTED_CLIENT_ACTIONS.MODIFY, payload: selected.client })
                                                setButtonText("delete")
                                            }}
                                        >
                                            edit
                                        </button>
                                    </div>
                                    <div className="info">
                                        <h1>{selected.client.name}</h1>
                                        {selected.client.preferredDeliveryType !== "Delivery" && (
                                            <p>
                                                <span className='bold'>Preferred delivery type: </span>
                                                {selected.client.preferredDeliveryType}
                                            </p>
                                        )}
                                        {selected.client.preferredDeliveryType === "Delivery" && (
                                            <p>
                                                <span className='bold'>Preferred delivery type: </span>
                                                {selected.client.preferredDeliveryType} to {selected.client.preferredDeliveryAddress}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}   
                        </div>                         
                    )}
                </div>
            </div>
        )
    }
}
