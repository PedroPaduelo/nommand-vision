export interface TokenPayload {
    userId: string;
    email: string;
    workspaceId: string;
}
export declare function signAccessToken(payload: TokenPayload): Promise<string>;
export declare function signRefreshToken(payload: TokenPayload): Promise<string>;
export declare function verifyAccessToken(token: string): Promise<TokenPayload>;
export declare function verifyRefreshToken(token: string): Promise<TokenPayload>;
