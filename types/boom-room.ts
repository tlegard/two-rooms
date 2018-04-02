interface BoomRoom {
  hostages: string[];
}

export interface ActiveBoomRoom extends BoomRoom {
  leader?: string;
  usurpVotes: {
    [player: string]: string;
  };
}

export interface TradingBoomRoom extends BoomRoom {
  leader: string;
  exchanged: boolean;
}
