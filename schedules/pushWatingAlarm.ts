import { scheduleJob } from "node-schedule";
import { type ExpoPushMessage } from "expo-server-sdk";
import { logStream } from "../streams";
import { knex } from "../repositories";
import { PUSH_CHANNEL_ID } from "../constants";
import { expo } from ".";

logStream.write(`Schedule Job pushWatingAlarm\n`);
scheduleJob({ hour: 8 }, async () => {
  const query = knex("task")
    .innerJoin("user", "task.user_id", "user.id")
    .where("progress", "todo")
    .whereNotNull("push_token")
    .groupBy("user_id", "progress")
    .select("user_id", "push_token")
    .count("*", { as: "num_of_todo" });

  const targetList = await query;
  const messages: ExpoPushMessage[] = targetList.map(
    ({ user_id, push_token, num_of_todo }) => ({
      to: push_token as string,
      title: `오늘은 어떤 일을 해볼까요?`,
      body: `${user_id}님을 기다리는 ${num_of_todo}개의 일이 있습니다!`,
      channelId: PUSH_CHANNEL_ID,
    })
  );

  await expo.sendPushNotificationsAsync(messages);

  for (const { to, title, body } of messages)
    logStream.write(`Send [ ${title} - ${body} ] to ${to}\n`);
});
