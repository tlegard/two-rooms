import * as React from "react";

const cardBack = require("./images/card_back.png");

const cards = {
  red: {
    bomber: require("./images/red_bomber.png"),
    engineer: require("./images/red_engineer.png"),
    spy: require("./images/red_spy.png"),
    ["coy boy"]: require("./images/red_coy_boy.png"),
    negotiator: require("./images/red_negotiator.png"),
    member: require("./images/red_member.png"),
    team: require("./images/red_team.png")
  },
  blue: {
    president: require("./images/blue_president.png"),
    member: require("./images/blue_member.png"),
    doctor: require("./images/blue_doctor.png"),
    spy: require("./images/blue_spy.png"),
    ["coy boy"]: require("./images/blue_coy_boy.png"),
    negotiator: require("./images/blue_negotiator.png"),
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
  onEndGame: Function;
};

type RoundState = {
  showingRole: boolean;
  showingTeam: boolean;
};

export default class Round extends React.Component<RoundProps, RoundState> {
  constructor(props: RoundProps) {
    super(props);
    this.state = {
      showingRole: true,
      showingTeam: false
    };
  }

  render() {
    const spyTeam =
      this.props.role === "spy"
        ? this.props.team === "blue" ? "red" : "blue"
        : this.props.team;
    const cardImage = this.state.showingTeam
      ? cards[spyTeam].team
      : this.state.showingRole
        ? cards[this.props.team][this.props.role]
        : cardBack;

    console.log(this.props.role);
    return (
      <div className="round">
        <div>
          {this.props.allowedToColorShare &&
          this.props.role !== "negotiator" && (
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
          {this.props.role !== "coy boy" && (
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
          )}
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
        <button onClick={() => this.props.onEndGame()}>End Game</button>
      </div>
    );
  }
}
