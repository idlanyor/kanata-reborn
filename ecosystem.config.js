export const apps = [
    {
        name: "k3",
        script: "npm",
        args: "start",
        instances: 1,
        autorestart: true,
        watch: false,
        max_memory_restart: "500M",
        env: {
            NODE_ENV: "production",
        },
    },
];