export type AppVariables = {
    user: {
        id: string;
        email: string;
        workspaceId: string;
    };
    requestId: string;
    workspaceId: string;
};
export type AppEnv = {
    Variables: AppVariables;
};
