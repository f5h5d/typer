import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import { PAGES } from "../../constants/constants.json";
import axios from "axios";
import { setCurrentPage } from "../redux/userSlice";
import { useTheme } from "styled-components";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Label,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import {
  setKeepTypingText,
  setTypingBackgroundInfo,
  setTypingText,
} from "../redux/typingSlice";
import toast from "react-hot-toast";

const Stats = () => {
  const API = import.meta.env.VITE_API;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const [statOptionSelected, setStatOptionSelected] = useState(0);
  const [raceHistoryOptionSelected, setRaceHistoryOptionSelected] = useState(0);
  const [tableRaceHistory, setTableRaceHistory] = useState([]);
  const [graphRaceHistory, setGraphRaceHistory] = useState([]);
  const [mainStatsHolder, setMainStatsHolder] = useState([]); // highest wpm, average wpm, average acc, total games, total games won
  const userStats = useSelector((state) => state.user.userStats);

  useEffect(() => {
    dispatch(setCurrentPage(PAGES.STATS));
  });

  useEffect(() => {
    const racesToLoad =
      raceHistoryOptionSelected == 0
        ? 10
        : raceHistoryOptionSelected == 1
        ? 25
        : raceHistoryOptionSelected == 2
        ? 50
        : -1; // -1 means all

    axios
      .get(`${API}/races/history/${statOptionSelected}/${racesToLoad}`, {
        withCredentials: true,
      })
      .then((response) => {
        let tableRaceHistoryData = [...response.data];
        let graphRaceHistoryData = [...response.data];

        setTableRaceHistory(tableRaceHistoryData);
        setGraphRaceHistory(
          graphRaceHistoryData.sort(
            (elementA, elementB) => elementA.race_number - elementB.race_number
          )
        );
      })
      .catch((err) => {
        toast.error(err.response.data.message);
      });

    axios
      .get(`${API}/races/mainStats/${statOptionSelected}`, {
        withCredentials: true,
      })
      .then(({ data }) => {
        setMainStatsHolder([
          data.highestWpm,
          Math.round(data.averageWpm),
          Math.round(data.averageAcc),
          data.totalRaces,
          data.totalWins,
        ]);
      })
      .catch((err) => {
        toast.error(err.response.data.message);
      });
  }, [raceHistoryOptionSelected, statOptionSelected]);

  const statOptionsButtons = ["All", "UN-Q", "UN-D"];

  const racesOptionsButtons = ["Last 10", "Last 25", "Last 50", "All"];

  const mainStats = [
    "highest wpm",
    "average wpm",
    "average acc",
    "total games",
    "games won",
  ];

  const tableHeaders = [
    "#",
    "wpm",
    "acc",
    "mode",
    "date",
    "won",
    "ranked",
    "text",
  ];

  const onRaceHistoryOptionSelected = (index) => {
    setRaceHistoryOptionSelected(index);
  };

  const onStatOptionSelected = (index) => {
    setStatOptionSelected(index);
  };

  const onPracticeText = (quote_id, words_id) => {
    const typingType = quote_id ? "quotes" : "words";
    const id = quote_id ? quote_id : words_id;

    axios.get(`${API}/${typingType}/${id}`).then(({ data }) => {
      dispatch(setTypingText(quote_id ? data.quote : data.words));
      dispatch(setTypingBackgroundInfo(data));
      dispatch(setKeepTypingText(true));
      navigate("/sandbox");
    }).catch(err => {
      toast.error(err.response.data.message);
    })
  };

  return (
    <Container>
      <OptionButtons>
        {statOptionsButtons.map((button, index) => {
          return (
            <button
              key={index}
              onClick={() => onStatOptionSelected(index)}
              className={`option-button ${
                statOptionSelected == index ? "option-button-selected" : ""
              }`}
            >
              {button}
            </button>
          );
        })}
      </OptionButtons>
      <MainStats>
        <div className="main-stats-inner-container">
          {mainStats.map((stat, index) => {
            return (
              <div className="stat second-row-stat" key={index}>
                <p className="stat-heading">{stat}</p>
                <h1 className="stat-value">{mainStatsHolder[index]}</h1>
              </div>
            );
          })}
        </div>
      </MainStats>

      <TableOptionButtons>
        <div className="race-inner-option-container">
          {racesOptionsButtons.map((option, index) => {
            return (
              <button
                key={index}
                onClick={() => onRaceHistoryOptionSelected(index)}
                className={`option-button ${
                  raceHistoryOptionSelected == index
                    ? "option-button-selected"
                    : ""
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
      </TableOptionButtons>

      <MainGraph>
        <div className="graph-container">
          <ResponsiveContainer className="graph">
            <ComposedChart data={graphRaceHistory}>
              <defs>
                <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={`${theme.colors.accent}`}
                    stopOpacity={0.1}
                  />
                  <stop
                    offset="95%"
                    stopColor={`${theme.colors.accent}`}
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={`${theme.colors.darkBackground}`} />
              <XAxis
                height={50}
                dy={10}
                tickCount={10}
                angle={0}
                interval="equidistantPreserveStart"
                dataKey="race_number"
                stroke={`${theme.colors.darkBackground}`}
                tick={{ fill: `${theme.colors.accent}` }}
              >
                <Label
                  dy={20}
                  value="Games Played"
                  position="middle"
                  style={{ fill: `${theme.colors.accent}` }}
                />
              </XAxis>
              <YAxis
                yAxisId="left"
                stroke={`${theme.colors.darkBackground}`}
                tick={{ fill: `${theme.colors.accent}` }}
                domain={[0, "dataMax+30"]}
                tickCount={6}
              >
                <Label
                  dy={20}
                  value="WPM"
                  angle={270}
                  position="insideLeft"
                  style={{ fill: `${theme.colors.accent}` }}
                />
              </YAxis>
              <Tooltip
                contentStyle={{
                  background: theme.colors.darkBackground,
                  border: `1px solid ${theme.colors.mediumBackground}`,
                  borderRadius: "5px",
                }}
                cursor={{ stroke: "transparent" }}
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="wpm"
                stroke={`${theme.colors.accent}`}
                fillOpacity={1}
                fill="url(#colorUv)"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </MainGraph>

      <MainTable>
        <div className="table-header">
          <div className="table-header-inner-container">
            {tableHeaders.map((header, index) => {
              const className = `${
                header == "#" ? "race-number" : header
              }-header`;
              return (
                <div className={className} key={index}>
                  {header}
                </div>
              );
            })}
          </div>
        </div>
        <div className="table-values">
          <div className="table-values-inner-container">
            {tableRaceHistory.map((stat, index) => {
              // if ( statOptionSelected == 1) { console.log(stat.createdAt); const testDate = new Date(stat.createdAt);console.log(testDate)}
              const properDate = new Date(stat.createdAt);
              const year = properDate.getFullYear().toString().substring(2);
              const month =
                properDate.getMonth() + 1 < 10
                  ? "0" + (properDate.getMonth() + 1)
                  : properDate.getMonth();
              const day =
                properDate.getDate() < 10
                  ? "0" + properDate.getMonth()
                  : properDate.getMonth();
              const hour =
                properDate.getHours() < 10
                  ? "0" + properDate.getHours()
                  : properDate.getHours();
              const minutes =
                properDate.getMinutes() < 10
                  ? "0" + properDate.getMinutes()
                  : properDate.getMinutes();
              const date =
                hour + ":" + minutes + " " + day + "/" + month + "/" + year;
              return (
                <div className="table-value" key={index}>
                  <div className="race-number">{stat.race_number}</div>
                  <div className="race-wpm">{stat.wpm}</div>
                  <div className="race-acc">{stat.accuracy}</div>
                  <div className="race-mode">
                    {stat.quote_id ? "quote" : "dictionary"}
                  </div>
                  <div className="race-date">{date}</div>
                  <div className="race-won">{stat.won ? "yes" : "no"}</div>
                  <div className="race-ranked">
                    {stat.ranked ? "yes" : "no"}
                  </div>
                  <div
                    className="race-text"
                    onClick={() => onPracticeText(stat.quote_id, stat.words_id)}
                  >
                    <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </MainTable>
    </Container>
  );
};

const Container = styled.div`
  width: 100vw;
  height: 200vh;

  @media (max-width: ${(props) => props.theme.breakpoints.lg}) {
    .race-inner-option-container {
      width: 900px !important;
    }

    .table-header {
      width: 900px !important;
    }

    .table-values {
      width: 900px !important;
    }

    .graph-container {
      width: 900px !important;

      path {
        /* fill: ${(props) => props.theme.colors.darkBackground}; */
      }
    }

    .main-stats-inner-container {
      width: 900px !important;
    }
  }

  @media (max-width: ${(props) => props.theme.breakpoints.md}) {
    .race-inner-option-container {
      width: 650px !important;
    }

    .table-header {
      width: 650px !important;

      .table-header-inner-container > div {
        font-size: ${(props) => props.theme.fontSizes.text} !important;
      }
    }

    .table-values {
      width: 650px !important;

      div {
        font-size: ${(props) => props.theme.fontSizes.text} !important;
      }
    }

    .graph-container {
      width: 650px !important;
    }

    .main-stats-inner-container {
      width: 650px !important;
      flex-wrap: wrap !important;
      .stat {
        flex: 1 1 calc(50% - 10px) !important;
      }
    }
  }

  @media (max-width: ${(props) => props.theme.breakpoints.sm}) {
    .race-inner-option-container {
      width: 400px !important;
    }

    .table-header {
      width: 400px !important;

      .mode-header {
        width: 30% !important;
      }

      .date-header {
        display: none;
      }

      .ranked-header {
        display: none;
      }
    }

    .table-values {
      width: 400px !important;

      .race-mode {
        width: 30% !important;
      }

      .race-date {
        display: none;
      }
      .race-ranked {
        display: none;
      }
    }

    .graph-container {
      width: 400px !important;
    }

    .main-stats-inner-container {
      width: 400px !important;
      flex-wrap: wrap !important;
      .stat {
        flex: 1 1 calc(50% - 10px) !important;
      }
    }
  }

  @media (max-width: ${(props) => props.theme.breakpoints.xs}) {
    .race-inner-option-container {
      width: 320px !important;
    }

    .table-header {
      width: 320px !important;

      .won-header {
        display: none;
      }

      .ranked-header {
        display: none;
      }

      .race-number-header {
        width: 15% !important;
      }

      .wpm-header {
        width: 15% !important;
      }

      .acc-header {
        width: 15% !important;
      }

      .mode-header {
        width: 30% !important;
      }

      .text-header {
        width: 20% !important;
      }
    }

    .table-values {
      width: 320px !important;

      .race-won {
        display: none;
      }
      .race-ranked {
        display: none;
      }

      .race-number {
        width: 15% !important;
      }

      .race-wpm {
        width: 15% !important;
      }

      .race-acc {
        width: 15% !important;
      }

      .race-mode {
        width: 30% !important;
      }

      .race-text {
        width: 20% !important;
      }
    }

    .graph-container {
      width: 320px !important;
    }

    .main-stats-inner-container {
      width: 320px !important;
      flex-wrap: wrap !important;
      .stat {
        flex: 1 1 calc(50% - 10px) !important;
      }
    }
  }
`;

const OptionButtons = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  height: 30px;
  border-radius: 10px;
  /* margin: 0 20px; */

  .option-button {
    width: 100px;
    height: 100%;
    background: ${(props) => props.theme.colors.accent};
    font-size: ${(props) => props.theme.fontSizes.text};
    color: ${(props) => props.theme.colors.text};
    opacity: 0.5;
    cursor: pointer;
  }

  .option-button-selected {
    opacity: 1;
  }

  .option-button:first-child {
    border-top-left-radius: 10px;
    border-bottom-left-radius: 10px;
    margin-left: 30px;
  }

  .option-button:last-child {
    border-top-right-radius: 10px;
    border-bottom-right-radius: 10px;
    margin-right: 30px;
  }
`;

const TableOptionButtons = styled(OptionButtons)`
  width: 100vw;
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
  margin-top: 40px;
  border-radius: 10px;
  .race-inner-option-container {
    width: 1094px;
    display: flex;
    margin-bottom: 10px;
    justify-content: flex-start;
  }

  .option-button {
    width: 125px;
    height: 30px;
  }
`;

const MainTable = styled.div`
  margin-top: 18px;
  width: 100vw;
  display: flex;
  align-items: center;
  flex-direction: column;
  .table-header {
    width: 1094px;
    height: 58px;
    background: ${(props) => props.theme.colors.darkBackground};
    display: flex;
    justify-content: center;
    padding-right: 10px;

    .table-header-inner-container {
      margin: 10px 0px;
      background: ${(props) => props.theme.colors.darkBackground};
      height: 41px;
      width: 95%;
      border-radius: 10px;
      display: flex;
      align-items: center;
      /* padding-right: 10px; */

      div {
        font-size: ${(props) => props.theme.fontSizes.label};
        color: ${(props) => props.theme.colors.text};
        margin-left: 10px;
      }

      .race-number-header {
        width: 10%;
      }
      .wpm-header {
        width: 10%;
      }
      .acc-header {
        width: 10%;
      }
      .text-header {
        width: 10%;
      }
      .mode-header {
        width: 20%;
      }
      .date-header {
        width: 20%;
      }
      .won-header {
        width: 10%;
      }
      .ranked-header {
        width: 10%;
      }
    }
  }

  .table-values {
    width: 1094px;
    margin-bottom: 50px;
    padding: 10px 0px;
    max-height: 630px;
    overflow-y: scroll;

    background: ${(props) => props.theme.colors.lightBackground};
    display: flex;
    flex-direction: column;
    align-items: center;
    /* justify-content: center; */

    .table-values-inner-container {
      width: 95%;
    }

    .table-value {
      margin: 10px 0px !important;
      background: ${(props) => props.theme.colors.darkBackground};
      height: 41px;
      border-radius: 10px;
      /* flex: 1 1 auto; */
      display: flex;
      align-items: center;
      div {
        font-size: ${(props) => props.theme.fontSizes.label};
        margin-left: 10px;
      }
    }

    .table-value:last-child {
      margin-bottom: 10px;
    }

    .race-number {
      width: 10%;
    }
    .race-wpm {
      width: 10%;
    }
    .race-acc {
      width: 10%;
    }
    .race-text {
      width: 10%;
      cursor: pointer;
      color: ${(props) => props.theme.colors.accent};
    }
    .race-mode {
      width: 20%;
    }
    .race-date {
      width: 20%;
    }
    .race-won {
      width: 10%;
    }
    .race-ranked {
      width: 10%;
    }
  }
`;

const MainGraph = styled.div`
  width: 100vw;

  display: flex;
  justify-content: center;
  .graph-container {
    width: 1094px;
    height: 392px;

    background: ${(props) => props.theme.colors.lightBackground};
    border-bottom: 3px solid ${(props) => props.theme.colors.accent};
    border-top-left-radius: 2px;
    border-top-right-radius: 2px;

    display: flex;
    justify-content: center;
    align-items: center;

    .graph {
      width: 95% !important;
      height: 90% !important;
    }
  }
`;

const MainStats = styled.div`
  width: 100vw;
  display: flex;
  justify-content: center;
  margin-top: 20px;
  margin-bottom: 18px;

  .main-stats-inner-container {
    width: 1094px;
    display: flex;
    justify-content: center;
    gap: 18px;
    .stat {
      flex: 1;
      height: 80px;
      background: ${(props) => props.theme.colors.lightBackground};
      border-bottom: 2px solid ${(props) => props.theme.colors.accent};
      border-top-left-radius: 2px;
      border-top-right-radius: 2px;

      .stat-heading {
        margin-top: 5px;
        font-size: ${(props) => props.theme.fontSizes.label};
        color: ${(props) => props.theme.colors.accent};
        margin-left: 15px;
      }

      .stat-value {
        font-size: ${(props) => props.theme.fontSizes.largeLabel};
        margin-top: 0;
        font-weight: normal;
        margin-left: 25px;
      }
    }

    .stat:first-child {
      margin: 0;
    }
  }
`;

export default Stats;
