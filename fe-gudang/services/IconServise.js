export const IconService = {
    async getIcons() {
        // Daftar icon bawaan PrimeIcons
        const icons = [
            { properties: { name: 'check' }, icon: { tags: ['success', 'ok'] } },
            { properties: { name: 'times' }, icon: { tags: ['close', 'cancel'] } },
            { properties: { name: 'spinner' }, icon: { tags: ['loading'] } },
            { properties: { name: 'plus' }, icon: { tags: ['add', 'new'] } },
            { properties: { name: 'minus' }, icon: { tags: ['remove', 'delete'] } },
            { properties: { name: 'search' }, icon: { tags: ['find', 'magnify'] } },
            { properties: { name: 'user' }, icon: { tags: ['account', 'profile'] } },
            { properties: { name: 'bell' }, icon: { tags: ['notification', 'alert'] } },
            { properties: { name: 'home' }, icon: { tags: ['house', 'start'] } },
            { properties: { name: 'cog' }, icon: { tags: ['settings', 'gear'] } },
            { properties: { name: 'power-off' }, icon: { tags: ['logout', 'exit'] } },
            { properties: { name: 'trash' }, icon: { tags: ['delete', 'remove'] } },
            { properties: { name: 'edit' }, icon: { tags: ['pencil', 'update'] } },
            { properties: { name: 'download' }, icon: { tags: ['save', 'get'] } },
            { properties: { name: 'upload' }, icon: { tags: ['send', 'up'] } },
            { properties: { name: 'lock' }, icon: { tags: ['secure', 'password'] } },
            { properties: { name: 'unlock' }, icon: { tags: ['open', 'access'] } },
            { properties: { name: 'calendar' }, icon: { tags: ['date', 'schedule'] } },
            { properties: { name: 'envelope' }, icon: { tags: ['email', 'message'] } },
            { properties: { name: 'shopping-cart' }, icon: { tags: ['cart', 'buy'] } }
        ];

        // Simulasi async (biar tetap sama seperti contoh bawaan)
        return new Promise((resolve) => {
            setTimeout(() => resolve(icons), 200);
        });
    }
};
