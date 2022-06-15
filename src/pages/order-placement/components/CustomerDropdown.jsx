import Dropdown from '../../../components/Dropdown';

export default function CustomerDropdown({ value, setValue, options }) {

    const onChange = (e) => {
        e.preventDefault();
        setValue(e.target.value)
    };

    return (
        <Dropdown 
            label={"Client: "}
            options={options}
            value={value.name}
            setValue={onChange}
        />
    )
}
