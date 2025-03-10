export const isOwner = (number) => {
    return globalThis.isOwner(number);
};

export const checkOwner = async (noTel) => {
    if (!isOwner(noTel)) {
        return false;
    }
    return true;
}; 