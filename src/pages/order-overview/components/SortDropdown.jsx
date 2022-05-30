import { useState } from 'react';
import Dropdown from '../../../components/Dropdown';

export default function SortDropdown() {
    // Change useState to change default value
    const [value, setValue] = useState("dt-asc");
    const options = [
        {label: "Date (ascending)", value: "dt-asc"},
        {label: "Date (descending)", value: "dt-dec"},
        {label: "Order qty (lg to sm)", value: "qty-lgtosm"},
        {label: "Order qty (sm to lg)", value: "qty-smtolg"}
    ];

    const onChange = (e) => {
        e.preventDefault();
        setValue(e.target.value);
    };

    return (
        <Dropdown
            label={"Sort:"}
            options={options}
            value={value}
            onChange={onChange}
        />
    )
}
