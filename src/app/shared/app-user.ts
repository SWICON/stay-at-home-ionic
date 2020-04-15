export interface AppUser {
    uid: string;
    email: string;
    nickName: string;
    isolationStartedAt: string;
    isDarkMode: boolean;
    isfirstLogin: boolean;
    latitude: number;
    longitude: number;
    geohash?: string;
    locale: any;
}
