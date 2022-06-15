import { useEffect } from 'react';
import Dropdown from '../../../components/Dropdown';

export default function ClientDropdown({ value, setValue, options }) {

    const onChange = (e) => {
        e.preventDefault();
        setValue(e.target.value)
    };

    return (
        <Dropdown 
            label={"Client: "}
            options={options}
            value={value}
            onChange={onChange}
        />
    )
}
