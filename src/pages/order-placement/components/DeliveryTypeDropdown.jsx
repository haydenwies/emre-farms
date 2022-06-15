import { DeliverTypeOptions } from '../../../backend/tempSettings';

import Dropdown from '../../../components/Dropdown';

export default function DeliveryTypeDropdown({ value, setValue }) {    

    const onChange = (e) => {
        e.preventDefault();
        setValue(e.target.value);
    };

    return (
        <Dropdown
            label={"Delivery type: "}
            options={DeliverTypeOptions}
            value={value}
            onChange={onChange}
        />
    )
}
