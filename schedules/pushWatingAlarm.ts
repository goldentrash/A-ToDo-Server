import { type ExpoPushMessage } from "expo-server-sdk";
import { rotatingStream } from "../streams";
import { knex } from "../repositories";
import { PUSH_CHANNEL_ID } from "../constants";
import { expo } from ".";

const query = knex("task")
  .innerJoin("user", "task.user_id", "user.id")
  .where("progress", "todo")
  .whereNotNull("push_token")
  .groupBy("user_id", "progress")
  .select("user_id", "push_token")
  .count("*", { as: "num_of_todo" });

export const pushWatingAlarm = async () => {
  const targetList = (await query) as unknown as {
    user_id: string;
    push_token: string;
    num_of_todo: number;
  }[];
  rotatingStream.logInfo(
    `Carry out pushWatingAlarm(target found: ${targetList.length})`
  );

  const messages: ExpoPushMessage[] = targetList.map(
    ({ user_id, push_token, num_of_todo }) => ({
      to: push_token,
      title: `오늘은 어떤 일을 해볼까요?`,
      body: `${user_id}님을 기다리는 ${num_of_todo}개의 일이 있습니다!`,
      channelId: PUSH_CHANNEL_ID,
    })
  );
  await expo.sendPushNotificationsAsync(messages);
  for (const { to, title, body } of messages)
    rotatingStream.logInfo(`Push [ ${title} - ${body} ] to ${to}`);
};
