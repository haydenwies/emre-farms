import { useState } from 'react';

import ItemCard from './components/ItemCard';
import DeliveryTypeDropdown from './components/DeliveryTypeDropdown';
import SortDropdown from './components/SortDropdown';

import './OrderPlacement.css';

export default function OrderPlacement() {
    const sizes = ["Small", "Medium", "Large"];
    // Handling button text
    const [buttonText, setButtonText] = useState("Submit order");

    const onSubmit = (e) => {
        e.preventDefault();
        if (buttonText === "Submit order") {
            setButtonText("Confirm")
        } else {
            console.log("submit");
            setButtonText("Submit order")
        }
    };

    return (
        <div className='order-placement'>
            <div className='pannel'>
                
                {/* Sorting */}
                <div>
                    <SortDropdown />
                    <DeliveryTypeDropdown />
                </div>
                {/* Item cards */}
                <div>
                    {sizes.map((size) => (
                        <ItemCard 
                            key={size}
                            size={size}
                        />
                    ))}
                </div>
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
