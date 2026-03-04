const flyToken = process.env.FLY_API_TOKEN;

export const sendGraphQLRequest = async (query: string, variables: any) => {
  try {
    const response = await fetch('https://api.fly.io/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${flyToken}`,
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      throw new Error(`GraphQL 请求失败: ${response.status} - ${response.statusText}`);
    }

    const result: any = await response.json();
    if (result.errors) {
      throw new Error(`GraphQL 错误: ${JSON.stringify(result.errors)}`);
    }

    return result.data;
  } catch (error: any) {
    throw new Error(`发送 GraphQL 请求失败: ${error.message}`);
  }
};

interface Machine {
  id: string;
  state: string;
  region: string;
}

export const getMachine = async (appName: string) => {
  const query = `
    query($appName: String!) {
      app(name: $appName) {
        machines {
          nodes {
            id
            state
            region
          }
        }
      }
    }
  `;

  const variables = { appName };
  const result = await sendGraphQLRequest(query, variables);

  const machines = result.app?.machines?.nodes || [];
  if (!machines.length) {
    console.error('未找到任何机器');
    return null;
  }

  const activeMachines = machines.filter(
    (machine: Machine) => !['destroying', 'destroyed'].includes(machine.state)
  );
  if (!activeMachines.length) {
    console.error('未找到活跃的机器');
    return null;
  }

  return activeMachines;
};

export const startMachine = async (appId: string, machineId: string) => {
  try {
    const response = await fetch(
      `https://api.machines.dev/v1/apps/${appId}/machines/${machineId}/start`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${flyToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to start machine: ${response.status} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error starting machine:', error);
    throw error;
  }
};

export const stopMachine = async (appId: string, machineId: string) => {
  try {
    const response = await fetch(
      `https://api.machines.dev/v1/apps/${appId}/machines/${machineId}/stop`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${flyToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to stop machine: ${response.status} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error stopping machine:', error);
    throw error;
  }
};

/** Fly 无单独 restart 端点，用 stop + start 实现重启 */
export const restartMachine = async (
  appId: string,
  machineId: string,
  waitMs = 3000
) => {
  await stopMachine(appId, machineId);
  await new Promise((r) => setTimeout(r, waitMs));
  return startMachine(appId, machineId);
};

export const executeCommand = async (
  appId: string,
  machineId: string,
  command: string[]
) => {
  try {
    const response = await fetch(
      `https://api.machines.dev/v1/apps/${appId}/machines/${machineId}/exec`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${flyToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          command,
          timeout: 300,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to execute command: ${response.status} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error executing command:', error);
    throw error;
  }
};

export const deleteFlyApp = async (appName: string) => {
  try {
    const response = await fetch(
      `https://api.machines.dev/v1/apps/${appName}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${flyToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.status === 202) {
      console.log(`Fly app ${appName} deletion accepted (202)`);
      return { success: true, message: 'App deletion accepted', status: 202 };
    }
    if (!response.ok) {
      throw new Error(`Failed to delete app: ${response.status} - ${response.statusText}`);
    }
    throw new Error(
      `Unexpected response status: ${response.status} - Expected 202 Accepted`
    );
  } catch (error) {
    console.error('Error deleting Fly app:', error);
    throw error;
  }
};
