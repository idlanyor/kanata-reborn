import { JSONFilePreset } from 'lowdb/node';

const defaultData = {
    users: []
}
const db = await JSONFilePreset('db.json', defaultData)

export const updateUser = async ({ id, userName, isPrem, points, credit }) => {
    const user = { id, userName, isPrem, points, credit };
    await db.update(({ users }) => {
        const existingUser = users.find(u => u.id === id);
        if (existingUser) {
            existingUser.userName = userName;
            existingUser.isPrem = isPrem;
            existingUser.points = points;
            existingUser.credit = credit;
        } else {
            users.push(user);
        }
    });
    return db.write()
}

export const registerUser = async ({ id, userName, isPrem, points, credit }) => {
    const user = { id, userName, isPrem, points, credit };
    await db.update(({ users }) => {
        const existingUser = users.find(u => u.id === id);
        if (existingUser) {
            existingUser.userName = userName;
            existingUser.isPrem = isPrem;
            existingUser.points = points;
            existingUser.credit = credit;
        } else {
            users.push(user);
        }
    });
    return db.write()
}

export const updatePoints = async ({ id, points }) => {
    // const user = { id, userName, isPrem, points, credit };
    await db.update(({ users }) => {
        const existingUser = users.find(u => u.id === id);
        if (existingUser) {
            existingUser.points += points;
        }
    });
    return db.write()
}


export const getUser = (id) => {
    return db.data.users.find(u => u.id === id)
}
export const addPrem = (id) => {
    return db.update(({ users }) => {
        const existingUser = users.find(u => u.id === id);
        if (existingUser) {
            existingUser.isPrem = true;
            existingUser.credit += 1000;
        }
    });
}
export const isPrem = (id) => {
    return db.data.users.find(u => u.id === id).isPrem
}
export const getCredit = (id) => {
    return db.data.users.find(u => u.id === id).credit
}
export const getPoints = (id) => {
    return db.data.users.find(u => u.id === id).points
}
export const getUserName = (id) => {
    return db.data.users.find(u => u.id === id).userName
}