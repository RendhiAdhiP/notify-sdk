export interface AuthCredentials {
    projectToken: string;
    origin: string;
}
export declare class AuthManager {
    private credentials;
    constructor(projectToken: string, origin: string);
    getProjectToken(): string;
    getOrigin(): string;
    setProjectToken(token: string): void;
    setOrigin(origin: string): void;
    getSocketAuth(): {
        project_token: string;
        origin: string;
    };
    getHttpHeaders(): Record<string, string>;
}
