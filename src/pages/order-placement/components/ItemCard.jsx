import { useState } from 'react';
import Dropdown from '../../../components/Dropdown';

export default function ItemCard({ size }) {
    // For type selection
    const [type, setType] = useState("ykg");
    const options = [
        {label: "Yukon gold", value: "ykg"},
        {label: "Other potato", value: "oth"}
    ];
    // For quantity selection
    const [quantity, setQuantity] = useState(1);

    // When user selects from type dropdown
    const onChangeType = (e) => {
        e.preventDefault();
        setType(e.target.value);
    };

    // When user sets quantity
    const onChangeQty = (e) => {
        e.preventDefault();
        setQuantity(e.target.value);
    };

    return (
        <div className='item-card'>
            <p>{size}</p>
            <Dropdown 
                label={""}
                options={options}
                value={type}
                onChange={onChangeType}
            />
            <input 
                type="number" 
                value={quantity}
                onChange={onChangeQty}
            />
        </div>
    )
}
