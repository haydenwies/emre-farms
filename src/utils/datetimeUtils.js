export const datetimeString = () => {

    const now = new Date();
    const formatDatetime = (date) => {
        return String(date.toISOString().replace("T"," ").substring(0, 19));
    };
    return formatDatetime(now);

};