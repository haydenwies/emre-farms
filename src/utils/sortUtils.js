export const sortDateAscending = (orders) => {
    const newOrders = orders.sort((a, b) => {
        return a["orderDate"].localeCompare(b["orderDate"])
    })
    return newOrders
}