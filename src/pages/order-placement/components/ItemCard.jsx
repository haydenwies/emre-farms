import { useReducer } from 'react';

import { SizeOptions, TypeOptions } from '../../../backend/tempSettings';

import Dropdown from '../../../components/Dropdown';

import '../OrderPlacement.css'

const ACTIONS = {
    UPDATE_SIZE: 'updateSize',
    UPDATE_TYPE: 'updateType',
    UPDATE_QTY: 'updateQty'
};

const reducer = (item, action) => {
    switch (action.type) {
        case ACTIONS.UPDATE_SIZE:
            // Change size attribute
            return { id: item.id, size: action.payload, type: item.type, quantity: item.quantity }
        case ACTIONS.UPDATE_TYPE:
            // Change type attribute
            return { id: item.id, size: item.size, type: action.payload, quantity: item.quantity }
        case ACTIONS.UPDATE_QTY:
            // Change quantity
            return { id: item.id, size: item.size, type: item.type, quantity: action.payload }
        default:
            return item
    };
};

export default function ItemCard({ id, order, setOrder }) {
    const [item, dispatch] = useReducer(reducer, { id: id, size: "", type: "", quantity: undefined });

    // Update order when attribute changes
    const updateOrder = () => {
        const newOrder = order.map((x) => (
            x.id === item.id ? item : x
        ));
        setOrder(newOrder);
    };

    const onDelete = () => {
        const newOrder = order.filter(x => x.id !== item.id)
        setOrder(newOrder)
    };

    return (
        <div className='item-card'>
            <div className="item-options">
                <div className="size-dropdown">
                    <Dropdown 
                        label={""}
                        options={SizeOptions}
                        value={item.size}
                        onChange={(e) => { 
                            dispatch({ type: ACTIONS.UPDATE_SIZE, payload: e.target.value });
                            updateOrder();
                        }}
                    />
                </div>
                <div className="type-dropdown">
                    <Dropdown 
                        label={""}
                        options={TypeOptions}
                        value={item.type}
                        onChange={(e) => { 
                            dispatch({ type: ACTIONS.UPDATE_TYPE, payload: e.target.value });
                            updateOrder();
                        }}
                    />
                </div>
            </div>
            <input 
                type="number" 
                defaultValue={item.quantity}
                placeholder={0}
                min={1}
                onChange={(e) => { 
                    dispatch({ type: ACTIONS.UPDATE_QTY, payload: e.target.value });
                }}
                onBlur={updateOrder}
            />
            <button
                onClick={(e) => {
                    e.preventDefault();
                    onDelete();
                }}
            >
                delete
            </button>
        </div>
    )
}
