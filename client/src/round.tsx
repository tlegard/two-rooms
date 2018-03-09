import * as React from "react";

const cardBack = require("./images/card_back.png");

const cards = {
  red: {
    bomber: require("./images/red_bomber.png"),
    member: require("./images/red_member.png"),
    team: require("./images/red_team.png")
  },
  blue: {
    president: require("./images/blue_president.png"),
    member: require("./images/blue_member.png"),
    team: require("./images/blue_team.png")
  },
  grey: {
    gambler: require("./images/grey_team.png"),
    team: require("./images/grey_team.png")
  }
};
type RoundProps = {
  team: "blue" | "red" | "grey";
  role: "member" | string;
  allowedToColorShare: boolean;
};

type RoundState = {
  showingRole: boolean;
  showingTeam: boolean;
};

export default class Round extends React.Component<RoundProps, RoundState> {
  constructor(props: RoundProps) {
    super(props);
    this.state = {
      showingRole: false,
      showingTeam: false
    };
  }

  render() {
    const cardImage = this.state.showingTeam
      ? cards[this.props.team].team
      : this.state.showingRole
        ? cards[this.props.team][this.props.role]
        : cardBack;

    return (
      <div className="round">
        <div>
          {this.props.allowedToColorShare && (
            <button
              onClick={() =>
                this.setState({
                  showingTeam: !this.state.showingTeam,
                  showingRole: false
                })}
            >
              Color Share
            </button>
          )}
          <button
            onClick={() => {
              this.setState({
                showingRole: !this.state.showingRole,
                showingTeam: false
              });
            }}
          >
            Card Share
          </button>
          <button
            onClick={() => {
              this.setState({
                showingRole: false,
                showingTeam: false
              });
            }}
          >
            Hide Card
          </button>
        </div>
        <figure>
          <img style={{ width: "300px" }} src={cardImage} />
        </figure>
      </div>
    );
  }
}
