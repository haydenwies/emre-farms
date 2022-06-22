import { ClientSortOptions } from '../../../backend/tempSettings';
import Dropdown from '../../../components/Dropdown';

export default function SortDropdown({ value, setValue, sortCallback }) {
    
    const onChange = (e) => {
        e.preventDefault();
        sortCallback(e.target.value);
        setValue(e.target.value);
    };

    return (
        <Dropdown
            label={"sort by: "}
            options={ClientSortOptions}
            value={value}
            onChange={onChange}
        />
    )
}
