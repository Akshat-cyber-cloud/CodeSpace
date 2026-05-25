import {  k8sCoreV1Api } from './config.js';

export const createPod = async (sandboxId) => {
    
    const podManifest = {
        metadata: {
            name: `sandbox-pod-${sandboxId}`,
            labels: {   
                app: 'sandbox',
                sandboxId: sandboxId
            }
        },
        spec: {
            volumes: [
                {
                    name: 'workspace-volume',
                    emptyDir: {}
                }
            ],
            initContainers: [
                {
                    name: 'init-container',
                    image: process.env.IMAGE_NAME_template || 'template',
                    imagePullPolicy: 'IfNotPresent',
                    command: ['sh', '-c', '[ -z "$(ls -A /seed)" ] && cp -r /workspace/. /seed/ || echo "Workspace not empty, skipping initialization"'],
                    volumeMounts: [
                        {
                            name: 'workspace-volume',
                            mountPath: '/seed'
                        }
                    ]
                }
            ],
            containers: [
                {
                    name: 'sandbox-container',
                    image: process.env.IMAGE_NAME_template || 'template',
                    imagePullPolicy: 'IfNotPresent',
                    ports: [
                        {
                            containerPort: 5173,
                            name : "http"
                        }
                    ],
                    resources: {
                        limits: {
                            cpu: '500m',
                            memory: '512Mi'
                        },
                        requests: {
                            cpu: '100m',
                            memory: '128Mi'
                        }
                    },
                    volumeMounts: [
                        {
                            name: 'workspace-volume',
                            mountPath: '/workspace'
                        }
                    ]
                },
                {
                    image: process.env.IMAGE_NAME_agent || 'agent',
                    imagePullPolicy: 'IfNotPresent',
                    name: 'agent-container',
                    ports: [ {containerPort: 3000, name: "agent-http"} ],
                    resources: {
                        limits: {
                            cpu: '500m',
                            memory: '512Mi'
                        },
                        requests: {
                            cpu: '100m',
                            memory: '128Mi'
                        }
                    },
                    volumeMounts: [
                        {
                            name: 'workspace-volume',
                            mountPath: '/workspace'
                        }
                    ]
                }
            ]
        }
    }

    const response = await k8sCoreV1Api.createNamespacedPod({
        namespace: 'default',
        body: podManifest
    })

    return response;
}