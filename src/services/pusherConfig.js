import Pusher from 'pusher-js';

export const pusherConfig = {
    key: "754560ead10b09393310",
    cluster: "eu",
    encrypted: true,
    authEndpoint: '/broadcasting/auth',
    auth: {
        headers: {
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            'Accept': 'application/json',
        }
    }
};

export const createPusherInstance = () => {
    return new Pusher(pusherConfig.key, {
        cluster: pusherConfig.cluster,
        encrypted: pusherConfig.encrypted,
        authEndpoint: pusherConfig.authEndpoint,
        auth: pusherConfig.auth
    });
};
