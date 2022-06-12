import { SortOptions } from '../../../backend/tempSettings';
import Dropdown from '../../../components/Dropdown';

export default function SortDropdown({ value, setValue }) {
    
    const onChange = (e) => {
        e.preventDefault();
        setValue(e.target.value);
    };

    return (
        <Dropdown
            label={"Sort:"}
            options={SortOptions}
            value={value}
            onChange={onChange}
        />
    )
}
