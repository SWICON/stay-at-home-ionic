import { Position } from './position';

export interface UserSettings {
    userUid: string;
    isolationStartedAt: string;
    isDarkMode: boolean;
    isfirstLogin: boolean;
    homePosition: Position;
}
