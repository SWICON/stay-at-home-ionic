import { Position } from './position';

export interface UserSettings {
    userUid: string;
    isolationStartedAt: string;
    homePosition: Position
}