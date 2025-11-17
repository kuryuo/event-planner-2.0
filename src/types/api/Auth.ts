export interface RegisterPayload {
    email: string;
    password: string;
}

export interface LoginPayload {
    email: string;
    password: string;
    twoFactorCode?: string;
    twoFactorRecoveryCode?: string;
}

export interface RefreshPayload {
    refreshToken: string;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    refreshExpiresAt: string;
}

export interface AuthResponse {
    data: AuthTokens;
}

export interface RecoverPayload {
    email: string;
}
