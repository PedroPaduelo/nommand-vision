import type { ListMarketplaceInput, InstallItemInput, RateItemInput } from '../schemas/marketplace.schema.js';
export declare function listItems(workspaceId: string, input: ListMarketplaceInput): Promise<{
    data: {
        installed: boolean;
        id: string;
        name: string;
        description: string | null;
        author: string;
        category: "agent" | "template" | "integration" | "plugin";
        iconUrl: string | null;
        bannerUrl: string | null;
        version: string | null;
        downloads: number;
        rating: string | null;
        tags: string[] | null;
        configSchema: any;
        createdAt: Date;
        updatedAt: Date;
    }[];
    meta: {
        total: number;
        page: number;
        perPage: number;
    };
}>;
export declare function getItem(id: string, workspaceId: string): Promise<{
    installCount: number;
    installed: boolean;
    userConfig: any;
    id: string;
    name: string;
    description: string | null;
    author: string;
    category: "agent" | "template" | "integration" | "plugin";
    iconUrl: string | null;
    bannerUrl: string | null;
    version: string | null;
    downloads: number;
    rating: string | null;
    tags: string[] | null;
    configSchema: any;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function installItem(workspaceId: string, itemId: string, userId: string, input: InstallItemInput): Promise<{
    success: boolean;
    reinstalled: boolean;
    installed?: undefined;
} | {
    success: boolean;
    installed: boolean;
    reinstalled?: undefined;
}>;
export declare function uninstallItem(workspaceId: string, itemId: string): Promise<{
    success: boolean;
}>;
export declare function listInstalled(workspaceId: string): Promise<({
    installConfig: any;
    installedAt: Date;
    id: string;
    name: string;
    description: string | null;
    author: string;
    category: "agent" | "template" | "integration" | "plugin";
    iconUrl: string | null;
    bannerUrl: string | null;
    version: string | null;
    downloads: number;
    rating: string | null;
    tags: string[] | null;
    configSchema: any;
    createdAt: Date;
    updatedAt: Date;
} | null)[]>;
export declare function rateItem(workspaceId: string, itemId: string, input: RateItemInput): Promise<{
    success: boolean;
    rating: number;
}>;
