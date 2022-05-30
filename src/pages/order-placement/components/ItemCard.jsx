import { useState } from 'react';
import Dropdown from '../../../components/Dropdown';

export default function ItemCard({ itemSize, itemType, itemQuantity }) {
    // For size selection
    const [size, setSize] = useState(itemSize);
    const sizeOptions = [
        {label: "Choose size", value: "n/a"},
        {label: "Mini Mini", value: "mm"},
        {label: "Mini", value: "m"},
        {label: "B-Size", value: "b"},
        {label: "10lb", value: "10lb"},
        {label: "Large box", value: "lbox"},
        {label: "Large bag", value: "lbag"},
        {label: "2nd grade", value: "2g"}
    ];
    // For type selection
    const [type, setType] = useState(itemType);
    const typeOptions = [
        {label: "Choose type", value: "n/a"},
        {label: "White", value: "w"},
        {label: "Red", value: "r"},
        {label: "Yellow flesh", value: "yf"},
        {label: "Yukon gold", value: "ykg"}
    ];
    // For quantity selection
    const [quantity, setQuantity] = useState(itemQuantity);

    // When user selects from size dropdown
    const onChangeSize = (e) => {
        e.preventDefault();
        setSize(e.target.value);
    };

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
            <Dropdown 
                label={""}
                options={sizeOptions}
                value={size}
                onChange={onChangeSize}
            />
            <Dropdown 
                label={""}
                options={typeOptions}
                value={type}
                onChange={onChangeType}
            />
            <input 
                type="number" 
                value={quantity}
                placeholder={0}
                min={1}
                onChange={onChangeQty}
            />
        </div>
    )
}
