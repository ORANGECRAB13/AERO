import request from 'sync-request-curl';
import 'dotenv/config';
import { getAstronautFromAstronautId, getTime } from './helper';
import { getData, setData } from './dataStore';
import { Astronaut, Launch, LLMMessageLog, missionLaunchState } from './interfaces';
import HTTPError from 'http-errors';

function llmAstronautAssistantRequestAndResponse(messageContent: string, astronaut: Astronaut, launch: Launch): string {
  // TODO You must decide on an appopriate pre-prompt to set the stage for your astronaut assistant so that it will only talk about space missions and related topics.
  const prePrompt = `You are AeroBot, a helpful astronaut assistant that helps with space missions. You shall not respond to anything that's not relevant to space missions and space mission related topics, and you shall direct the astronaut to talk about space missions. You are talking to astornaut ${astronaut.rank} ${astronaut.nameFirst} ${astronaut.nameLast} which is currently in a mission [${launch.missionCopy.target}] ${launch.missionCopy.name}. You are friendly, concise.`;
  const res = request(
    'POST',
    'https://openrouter.ai/api/v1/chat/completions',
    {
      headers: {
        Authorization: `Bearer ${process.env.API_KEY}`,
        'Content-Type': 'application/json'
      },
      json: {
        model: 'google/gemma-3n-e2b-it:free',
        messages: [
          {
            role: 'assistant',
            content: prePrompt + messageContent
          }
        ]
      }
    }
  );

  const output = JSON.parse(res.getBody() as string);
  const rawMessage = output.choices[0].message.content;
  const message = rawMessage.replace(/\\n/g, '\n');

  return message;
}

export function llmAstronautChat(astronautId: number, messageRequest: string): { messageResponse: string } {
  const astronaut = getAstronautFromAstronautId(astronautId);
  const launch = getData().launches.find(
    launch => launch.allocatedAstronauts.includes(astronautId) && launch.state !== missionLaunchState.ON_EARTH);
  if (!launch) throw HTTPError(400, 'The astronaut is not in an active launch');

  let launchMessageLog = astronaut.llmChatHistory.find(log => log.launchId === launch.launchId);
  if (!launchMessageLog) {
    astronaut.llmChatHistory.push({ launchId: launch.launchId, messageLog: [] });
    launchMessageLog = astronaut.llmChatHistory.find(log => log.launchId === launch.launchId);
  }

  const userChatLog: LLMMessageLog = {
    astronautId: astronautId,
    messageId: launchMessageLog.messageLog.length + 1,
    messageContent: messageRequest,
    chatBotResponse: false,
    timeSent: getTime()
  };
  launchMessageLog.messageLog.push(userChatLog);

  let messageResponse;
  try {
    messageResponse = llmAstronautAssistantRequestAndResponse(messageRequest, astronaut, launch);
    console.log(messageResponse);
    const botChatLog: LLMMessageLog = {
      astronautId: astronautId,
      messageId: launchMessageLog.messageLog.length + 1,
      messageContent: messageResponse,
      chatBotResponse: true,
      timeSent: getTime()
    };
    launchMessageLog.messageLog.push(botChatLog);
  } catch (error) {
    // debugging purposes
    console.error(error);
  }

  setData(getData());
  return { messageResponse: messageResponse ?? 'AeroBot failed to response' };
}

type llmChatHistoryReturn = {
  launchId: number;
  messageLog: LLMMessageLog[];
}[]

export function llmAstronautChatHistory(astronautId: number): { chatHistory: llmChatHistoryReturn } {
  const astronaut = getAstronautFromAstronautId(astronautId);
  const launch = getData().launches.find(
    launch => launch.allocatedAstronauts.includes(astronautId) && launch.state !== missionLaunchState.ON_EARTH);
  if (!launch) throw HTTPError(400, 'The astronaut is not in an active launch');

  return { chatHistory: astronaut.llmChatHistory };
}
