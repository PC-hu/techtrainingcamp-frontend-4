import React, { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { StateType } from '../reducers';
import useWebSocket from 'react-use-websocket';
import { setrankAction, setendAction } from '../actions/';
import { serverurl } from '../config';
import SmallBoard from './SmallBoard';
import TableScrollbar from 'react-table-scrollbar';
const Rank: React.FC = () => {
  const dispatch = useDispatch();
  const rankdata = useSelector((state: StateType) => state.rankdata);
  const single = useSelector((state: StateType) => state.singleplayer);
  const score = useSelector((state: StateType) => state.score);
  const defeat = useSelector((state: StateType) => state.defeat);
  const board = useSelector((state: StateType) => state.board);
  const victory = useSelector(
    (state: StateType) => state.victory && !state.victoryDismissed
  );
  const pname = useSelector((state: StateType) => state.playername);
  const {
    sendJsonMessage,
    lastJsonMessage,
    readyState,
  } = useWebSocket(serverurl, { share: true });
  const sendstatus = useCallback(() => {
    if (single) return;
    let stat: string = '游戏中';
    if (victory) stat = '胜利';
    if (defeat) stat = '失败';
    sendJsonMessage({
      type: 'data',
      name: pname,
      score: score,
      status: stat,
      board: board,
    });
  }, [score, victory, defeat, board]);
  const receive = useCallback(() => {
    let message = lastJsonMessage;
    if (message !== null) {
      if (message.type === 'rank') dispatch(setrankAction(lastJsonMessage));
      else if (message.type === 'time')
        dispatch(setendAction(message.duration));
    }
  }, [lastJsonMessage]);
  useEffect(() => {
    if (pname === '') return;
    sendJsonMessage({ type: 'login', name: pname });
  }, [pname]);
  useEffect(() => {
    sendstatus();
  }, [sendstatus]);
  useEffect(() => {
    receive();
  }, [receive]);
  if (!single) {
    return (
      <TableScrollbar height="600px" width="100%">
        <table>
          <tbody>
            {rankdata.map((RankItem, index) => (
              <tr className="item" key={index}>
                <td>{index + 1}</td>
                <td>{RankItem.pname}</td>
                <td>{RankItem.score}</td>
                <td>{RankItem.state}</td>
                <td>
                  <SmallBoard board={RankItem.board} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableScrollbar>
    );
  }
  return null;
};

export default Rank;
