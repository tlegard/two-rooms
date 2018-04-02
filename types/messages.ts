export enum MessageTypes {
  Join = "JOIN",
  Leave = "LEAVE",
  ForceStart = "FORCE_START",
  UnforceStart = "UNFORCE_START",
  Usurp = "USURP",
  Relinquish = "RELINQUISH",
  Capture = "CAPTURE",
  Release = "RELEASE",
  Exchange = "EXCHANGE",
  End = "END",
  Abdicate = "ABDICATE",
  GamblerBet = "GAMBLER_BET"
}

export type UnstartedMessageData =
  | {
      type: MessageTypes.Leave;
    }
  | {
      type: MessageTypes.Join;
      name: string;
    };

export type AllowedToStartMessageData =
  | {
      type: MessageTypes.ForceStart | MessageTypes.UnforceStart;
    }
  | UnstartedMessageData;

export type ActiveMessageData =
  | {
      type:
        | MessageTypes.Usurp
        | MessageTypes.Relinquish
        | MessageTypes.Capture
        | MessageTypes.Release
        | MessageTypes.Abdicate;
      player: string;
    }
  | {
      type: MessageTypes.End;
    };
export type TransitioningMessageData =
  | {
      type: MessageTypes.Capture | MessageTypes.Release;
      player: string;
    }
  | {
      type: MessageTypes.Exchange | MessageTypes.End;
    };

export type EndingMessageData =
  | {
      type: MessageTypes.End;
    }
  | {
      type: MessageTypes.GamblerBet;
      vote: "red" | "blue";
    };
