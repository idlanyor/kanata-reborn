export const getStatIcon = (stat) => {
    const icons = {
        attack: '⚔️',
        defense: '🛡️',
        health: '❤️',
        mana: '💫',
        stamina: '⚡',
        hunger: '🍖',
        thirst: '🥤',
        energy: '💪'
    };
    return icons[stat] || '📊';
};

export const getTypeIcon = (type) => {
    const icons = {
        weapon: '⚔️',
        armor: '🛡️',
        consumable: '🧪',
        food: '🍖',
        drink: '🥤',
        material: '📦',
        misc: '🎁'
    };
    return icons[type] || '📦';
}; 