import { useState } from 'react';
import { collection, doc, setDoc } from 'firebase/firestore';

import { db } from '../../../backend/config';

import DeliveryTypeDropdown from './DeliveryTypeDropdown';

import '../OrderPlacement.css';

export default function AddClientModal({ getClients, setShowModal }) {
    const [newClient, setNewClient] = useState({name: "", preferredDeliveryType: ""});

    const isOrderComplete = () => {
        if (newClient.name.toLowerCase() !== "other") {
            if (newClient.name !== "" && newClient.preferredDeliveryType !== "") {
                return true;
            } else {
                return false;
            };
        } else {
            window.alert("Cannot name client 'other'.")
        };
    };

    const onSave = async () => {
        const docRef = doc(collection(db, "clients"));
        await setDoc(docRef, {
            name: newClient.name,
            id: docRef.id,
            preferredDeliveryType: newClient.preferredDeliveryType
        });
        getClients()
        setShowModal(false)
    }

    return (
        <div className="modal-frame">
            <div className="modal">
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
                            setNewClient({ name: e.target.value, preferredDeliveryType: newClient.preferredDeliveryType })
                        }}
                    />
                    <DeliveryTypeDropdown 
                        value={newClient.preferredDeliveryType}
                        setValue={(preferredDeliveryType) => {
                            setNewClient({ name: newClient.name, preferredDeliveryType: preferredDeliveryType })
                        }}
                    />
                </div>
            </div>
        </div>
    )
}
