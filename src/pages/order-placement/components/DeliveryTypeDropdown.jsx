import { useState } from 'react';
import Dropdown from '../../../components/Dropdown';

export default function DeliveryTypeDropdown() {
    // Change useState to change default value
    const [value, setValue] = useState("type1");
    const options = [
        {label: "Delivery type 1", value: "type1"},
        {label: "Delivery type 2", value: "type2"},
        {label: "Delivery type 3", value: "type3"}
    ];

    const onChange = (e) => {
        e.preventDefault();
        setValue(e.target.value);
    };

    return (
        <Dropdown
            label={"Delivery type:"}
            options={options}
            value={value}
            onChange={onChange}
        />
    )
}
