export interface UserSettings {
    userUid: string;
    isolationStartedAt: string;
    homePosition: {
        latitude: number;
        longitude: number;
    }
}