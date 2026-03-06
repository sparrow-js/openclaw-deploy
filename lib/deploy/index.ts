import { broadcast } from "@/utils/broadcast";

export const installDependenciesAction = async (
    appId: string,
    customDependencies: string = "",
    commitMessage: string = "Update package.json dependencies"
) => {
    await broadcast(appId, 'message', {
        chatId: appId,
        status: 'installing',
        type: 'install'
    });
    const response = await fetch(
        `https://api.github.com/repos/wordixai/clone-action/actions/workflows/install.yml/dispatches`,
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${process.env.GITHUB_TOKEN || process.env.NEXT_PUBLIC_GITHUB_TOKEN}`,
                Accept: 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ref: 'main',
                inputs: {
                    fly_api_token: process.env.FLY_API_TOKEN,
                    fly_app_name: appId,
                    custom_dependencies: customDependencies,
                    git_user_email: 'needwareofficial@gmail.com',
                    git_user_name: 'needware',
                    commit_message: commitMessage,
                    client_id: appId,
                }
            })
        }
    );

    if (!response.ok) {
        throw new Error(`GitHub API error: ${response.statusText}`);
    }

    return response;
};


export async function deployOpenClaw({
    flyAppName,
    dockerImage,
    primaryRegion,
    volumeName,
    clientId,
    openclawConfig,
    openrouterApiKey: customOpenrouterApiKey,
}: {
    flyAppName: string;
    dockerImage?: string;
    primaryRegion?: string;
    volumeName?: string;
    clientId: string;
    openclawConfig?: Record<string, any>;
    openrouterApiKey?: string; // 支持传入实例独立的 OpenRouter API Key
}) {
    const githubToken = process.env.GITHUB_TOKEN || process.env.NEXT_PUBLIC_GITHUB_TOKEN;
    const flyApiToken = process.env.FLY_API_TOKEN;
    // 优先使用传入的实例独立 Key，回退到全局 Key
    const openrouterApiKey = customOpenrouterApiKey;
    if (!openrouterApiKey) {
        return { error: 'OpenRouter API Key is not configured' };
    }

    if (!githubToken) {
        return { error: 'GitHub token is not configured' };
    }

    if (!flyApiToken) {
        return { error: 'Fly.io API token is not configured' };
    }

    // Base64 编码 openclaw 配置
    const openclawConfigBase64 = openclawConfig
        ? Buffer.from(JSON.stringify(openclawConfig, null, 2)).toString('base64')
        : '';

    const githubResponse = await fetch(
        'https://api.github.com/repos/sparrow-js/openclaw-deploy/actions/workflows/deploy-openclaw.yml/dispatches',
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${githubToken}`,
                Accept: 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ref: 'main',
                inputs: {
                    fly_api_token: flyApiToken,
                    fly_app_name: flyAppName,
                    docker_image: dockerImage || 'registry.fly.io/openclawinstall:deployment-01KK12KGDD5BNM28QX286Y6G6Z',
                    primary_region: primaryRegion || 'sin',
                    volume_name: volumeName || 'openclaw_shop_data',
                    client_id: clientId,
                    openrouter_api_key: openrouterApiKey || '',
                    openclaw_config_base64: openclawConfigBase64,
                },
            }),
        }
    );

    if (!githubResponse.ok) {
        const errorText = await githubResponse.text();
        return { error: `GitHub API error: ${githubResponse.status} - ${errorText}` };
    }

    const responseText = await githubResponse.text();

    if (!responseText) {
        console.log('Empty response from GitHub API - OpenClaw deploy workflow dispatch successful');
        return { success: true };
    }

    try {
        const data = JSON.parse(responseText);
        console.log('GitHub API response:', data);
        return data;
    } catch (error) {
        console.error('Error parsing GitHub API response:', error);
        return { error: 'Failed to parse GitHub API response' };
    }
}
