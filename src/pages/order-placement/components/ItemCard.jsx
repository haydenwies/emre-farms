import { useEffect } from 'react';
import { useState } from 'react';
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
    const [sizeOptions, setSizeOptions] = useState(SizeOptions)
    const [typeOptions, setTypeOptions] = useState(TypeOptions)

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

    const filterSizeOptions = () => {
        if (item.type !== "") {
            const currentItemSizes = order.filter(x => x.type === item.type && x.id !== item.id)
            const currentSizes = []
            currentItemSizes.forEach((item) => {
                if (currentSizes.filter(x => x === item.size).length === 0) {
                    currentSizes.push(item.size)
                }
            })
            const newSizeOptions = SizeOptions.filter(x => !currentSizes.includes(x.value))
            setSizeOptions(newSizeOptions)
            // return newSizeOptions;
        } else {
            setSizeOptions(SizeOptions)
            // return SizeOptions;
        }
    }

    const filterTypeOptions = () => {
        if (item.size !== "") {
            const currentItemTypes = order.filter(x => x.size === item.size && x.id !== item.id)
            const currentTypes = []
            currentItemTypes.forEach((item) => {
                if (currentTypes.filter(x => x === item.type).length === 0) {
                    currentTypes.push(item.type)
                }
            })
            const newTypeOptions = TypeOptions.filter(x => !currentTypes.includes(x.value))
            setTypeOptions(newTypeOptions);
            // return newSizeOptions;
        } else {
            setTypeOptions(TypeOptions);
            // return SizeOptions;
        }
    }

    useEffect(() => {
        updateOrder();
    }, [item])

    useEffect(() => {
        filterSizeOptions()
        filterTypeOptions()
    }, [order])

    return (
        <div className='item-card'>
            <div className="item-options">
                <div className="size-dropdown">
                    <Dropdown 
                        label={""}
                        options={sizeOptions}
                        value={item.size}
                        onChange={async (e) => { 
                            dispatch({ type: ACTIONS.UPDATE_SIZE, payload: e.target.value })
                        }}
                    />
                </div>
                <div className="type-dropdown">
                    <Dropdown 
                        label={""}
                        options={typeOptions}
                        value={item.type}
                        onChange={(e) => { 
                            dispatch({ type: ACTIONS.UPDATE_TYPE, payload: e.target.value });
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
