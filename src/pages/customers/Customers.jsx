import { useState } from 'react';
import './Customers.css'

export default function Customers() {
    const [customers, setCustomers] = useState([
        {id: 0, name: "customer01"},
        {id: 1, name: "customer02"},
        {id: 2, name: "customer03"}
    ]);

    const onAdd = (e) => {
        e.preventDefault();
        // Show popup
    };

    return (
        <div className='customers'>
            <button
            onClick={onAdd}>
                add
            </button>
            {customers.map((customer) => (
                <div key={customer.id}>
                    <p>{customer.name}</p>
                </div>
            ))}
        </div>
    )
}
