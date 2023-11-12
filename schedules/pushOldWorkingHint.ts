import { type ExpoPushMessage } from "expo-server-sdk";
import { rotatingStream } from "../streams";
import { knex } from "../repositories";
import { PUSH_CHANNEL_ID, OLD_WORKING_BASE_TIME } from "../constants";
import { expo } from ".";

const query = knex("task")
  .innerJoin("user", "task.user_id", "user.id")
  .where("progress", "doing")
  .whereNotNull("push_token")
  .select("user_id", "push_token")
  .select(
    knex.raw("HOUR(TIMEDIFF(CURRENT_TIMESTAMP, `started_at`)) AS time_passed")
  )
  .having("time_passed", ">=", OLD_WORKING_BASE_TIME);

export const pushOldWorkingHint = async () => {
  const targetList = (await query) as unknown as {
    user_id: string;
    push_token: string;
    time_passed: number;
  }[];
  rotatingStream.logInfo(
    `Carry out pushOldWorkingHint(target found: ${targetList.length})`
  );

  const messages: ExpoPushMessage[] = targetList.map(
    ({ user_id, push_token, time_passed }) => ({
      to: push_token,
      title: `더 작은 일로 쪼개보시는 건 어떤가요?`,
      body: `${user_id}님이 일을 시작하신지 ${time_passed}시간이 지났습니다.`,
      channelId: PUSH_CHANNEL_ID,
    })
  );
  await expo.sendPushNotificationsAsync(messages);
  for (const { to, title, body } of messages)
    rotatingStream.logInfo(`Push [ ${title} - ${body} ] to ${to}`);
};
