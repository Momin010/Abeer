export enum GameState {
  INTRO = 'INTRO',
  CELEBRATING = 'CELEBRATING',
  FINISHED = 'FINISHED'
}

export interface BirthdayMessage {
  text: string;
  author: string;
}

export interface BalloonData {
  id: number;
  x: number;
  y: number;
  z: number;
  color: string;
  speed: number;
}