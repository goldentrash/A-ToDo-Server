import { scheduleJob } from "node-schedule";
import { type ExpoPushMessage } from "expo-server-sdk";
import { logStream } from "../streams";
import { knex } from "../repositories";
import {
  PUSH_CHANNEL_ID,
  SCHEDULE_PUSH_OLD_WORKING_HINT,
  OLD_WORKING_BASE_TIME,
} from "../constants";
import { expo } from ".";

logStream.write(`Schedule Job pushOldWorkingHint\n`);
scheduleJob(SCHEDULE_PUSH_OLD_WORKING_HINT, async () => {
  const query = knex("task")
    .innerJoin("user", "task.user_id", "user.id")
    .where("progress", "doing")
    .whereNotNull("push_token")
    .select("user_id", "push_token")
    .select(
      knex.raw("HOUR(TIMEDIFF(CURRENT_TIMESTAMP, `started_at`)) AS time_passed")
    )
    .having("time_passed", ">=", OLD_WORKING_BASE_TIME);

  const targetList = (await query) as unknown as {
    user_id: string;
    push_token: string;
    time_passed: number;
  }[];
  const messages: ExpoPushMessage[] = targetList.map(
    ({ user_id, push_token, time_passed }) => ({
      to: push_token,
      title: `일이 잘 풀리지 않으시나요?`,
      body: `${user_id}님이 일을 시작하신 지 ${time_passed}시간이 지났어요. 더 작은 일로 쪼개보는 건 어떠신가요?`,
      channelId: PUSH_CHANNEL_ID,
    })
  );

  await expo.sendPushNotificationsAsync(messages);

  for (const { to, title, body } of messages)
    logStream.write(`Send [ ${title} - ${body} ] to ${to}\n`);
});
