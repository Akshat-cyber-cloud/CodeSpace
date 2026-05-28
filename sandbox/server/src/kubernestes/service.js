import { k8sCoreV1Api } from "./config.js";

export const createService = async (sandboxId) => {
    const serviceManifest = {
        metadata: {
            name: `sandbox-service-${sandboxId}`,
            labels: {
                app: 'sandbox-runtime', 
                sandboxId: sandboxId
            }
        },
        spec: {
            selector: {
                app: 'sandbox',
                sandboxId: sandboxId
            },
            ports: [
                {
                    name: "http",
                    port: 80,
                    targetPort: 5173,
                    protocol: "TCP"
                },
                {
                    name: "agent-http",
                    port: 3000,
                    targetPort: 3000,
                    protocol: "TCP"
                }
            ],
            type: "ClusterIP"

        }
    }

    const response = await k8sCoreV1Api.createNamespacedService({
        namespace: 'default',
        body: serviceManifest
    });

    return response;
}

export const deleteService = async (sandboxId) => {
    const name = `sandbox-service-${sandboxId}`;
    try {
        await k8sCoreV1Api.deleteNamespacedService({ name, namespace: 'default' });
        console.log(`Deleted service ${name}`);
    } catch (e) {
        try {
            await k8sCoreV1Api.deleteNamespacedService(name, 'default');
            console.log(`Deleted service ${name} (legacy API)`);
        } catch (innerE) {
            console.error(`Failed to delete service ${name}:`, innerE.message);
        }
    }
}