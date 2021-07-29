import { Token } from './Token';

export interface RefreshTokenDto extends Token {
  overdue: boolean;
}
