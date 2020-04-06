import {UserSettings} from './user-settings.interface';

export interface AppUser {
    uid: string;
    email: string;
    displayName: string;
    nickName: string;
    photoURL: string;
    emailVerified: boolean;
    userSettings: UserSettings;
}
