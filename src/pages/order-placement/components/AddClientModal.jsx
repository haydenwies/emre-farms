import { useState } from 'react';
import { collection, doc, setDoc } from 'firebase/firestore';

import { db } from '../../../backend/config';

import DeliveryTypeDropdown from './DeliveryTypeDropdown';

import '../OrderPlacement.css';

export default function AddClientModal({ getClients, setShowModal }) {
    const [newClient, setNewClient] = useState({ name: "", preferredDeliveryAddress: "", preferredDeliveryType: "" });

    const isOrderComplete = () => {
        if (
            newClient.name !== "" && 
            (
                (newClient.preferredDeliveryType !== "" &&  newClient.preferredDeliveryType !== "Delivery") || 
                (newClient.preferredDeliveryType === "Delivery" && newClient.preferredDeliveryAddress !== "")
            )
        ) {
            return true;
        } else {
            return false;
        };
    };

    const onSave = async () => {
        if (newClient.name.toLowerCase() !== "other") {
            const docRef = doc(collection(db, "clients"));
            await setDoc(docRef, {
                name: newClient.name,
                id: docRef.id,
                preferredDeliveryAddress: newClient.preferredDeliveryAddress,
                preferredDeliveryType: newClient.preferredDeliveryType
            });
            getClients()
            setShowModal(false)
        } else {
            window.alert("Cannot name client 'other'.");
        };
    }

    return (
        <div className="modal-frame">
            <div className="add-client-modal">
                <div className="options">
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            setShowModal(false);
                        }}
                    >
                        close
                    </button>
                    <button
                        disabled={!isOrderComplete()}
                        className={isOrderComplete() ? "" : "disabled"}
                        onClick={(e) => {
                            e.preventDefault();
                            onSave();
                        }}
                    >
                        save
                    </button>
                </div>
                <div className="client-info">
                    <input 
                        type="text" 
                        placeholder="client name"
                        value={newClient.name}
                        onChange={(e) => {
                            console.log(newClient)
                            setNewClient({ name: e.target.value, preferredDeliveryAddress: newClient.preferredDeliveryAddress, preferredDeliveryType: newClient.preferredDeliveryType })
                        }}
                    />
                    <DeliveryTypeDropdown 
                        value={newClient.preferredDeliveryType}
                        setValue={(preferredDeliveryType) => {
                            console.log(newClient)
                            setNewClient({ name: newClient.name, preferredDeliveryAddress: newClient.preferredDeliveryAddress, preferredDeliveryType: preferredDeliveryType })
                        }}
                    />
                    {newClient.preferredDeliveryType === "Delivery" && (                    
                        <input 
                            type="text" 
                            placeholder="preferred delivery address"
                            value={newClient.preferredDeliveryAddress}
                            onChange={(e) => {
                                console.log(newClient)
                                setNewClient({ name: newClient.name, preferredDeliveryAddress: e.target.value, preferredDeliveryType: newClient.preferredDeliveryType })
                            }}
                        />
                    )}
                </div>
            </div>
        </div>
    )
}
