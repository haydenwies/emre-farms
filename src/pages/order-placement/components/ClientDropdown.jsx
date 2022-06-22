import Dropdown from '../../../components/Dropdown';

export default function ClientDropdown({ value, setValue, options }) {

    const onChange = (e) => {
        e.preventDefault();
        setValue(e.target.value)
    };

    return (
        <Dropdown 
            label={"client: "}
            options={options}
            value={value}
            onChange={onChange}
        />
    )
}
