import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import { HttpError } from "http-errors";
import { knex, taskRepo } from ".";
import { seed, testUserData } from "../seeds/testUser";

chai.use(chaiAsPromised);

describe("Task Repository", function () {
  beforeEach(async function () {
    await seed(knex);
  });

  describe("Insert & Find", function () {
    it("생성한 task는 조회 가능해야 함", async function () {
      // given
      const newTaskData: Parameters<typeof taskRepo.insert>[1] = {
        user_id: testUserData.id,
        content: "sample content",
        deadline: "2023-11-12",
      };

      // when
      const taskId = await taskRepo.insert(knex, newTaskData);

      // then
      const insertedTask = await taskRepo.findById(knex, taskId);
      return expect(
        taskRepo.findByUser(knex, testUserData.id, {
          sort: null,
          filter: { progress: ["todo"] },
        })
      ).to.eventually.deep.include.members([insertedTask]);
    });
  });

  describe("Update", function () {
    it("생성한 task는 start 가능해야 함", async function () {
      // given
      const newTaskData: Parameters<typeof taskRepo.insert>[1] = {
        user_id: testUserData.id,
        content: "sample content",
        deadline: "2023-11-12",
      };
      const taskId = await taskRepo.insert(knex, newTaskData);

      // when
      await taskRepo.updateProgress(knex, { id: taskId, progress: "doing" });

      // then
      return expect(taskRepo.findById(knex, taskId)).to.eventually.deep.include(
        {
          progress: "doing",
        }
      );
    });

    it("시작한 task는 finish 가능해야 함", async function () {
      // given
      const newTaskData: Parameters<typeof taskRepo.insert>[1] = {
        user_id: testUserData.id,
        content: "sample content",
        deadline: "2023-11-12",
      };
      const taskId = await taskRepo.insert(knex, newTaskData);
      await taskRepo.updateProgress(knex, { id: taskId, progress: "doing" });

      // when
      await taskRepo.updateProgress(knex, { id: taskId, progress: "done" });

      // then
      return expect(taskRepo.findById(knex, taskId)).to.eventually.deep.include(
        {
          progress: "done",
        }
      );
    });

    it('시작하지 않은 task를 finish 하면 "Task Unstarted"를 throw해야 함', async function () {
      // given
      const newTaskData: Parameters<typeof taskRepo.insert>[1] = {
        user_id: testUserData.id,
        content: "sample content",
        deadline: "2023-11-12",
      };
      const taskId = await taskRepo.insert(knex, newTaskData);

      // when

      // then
      return expect(
        taskRepo.updateProgress(knex, { id: taskId, progress: "done" })
      ).to.eventually.be.rejectedWith(HttpError, "Task Unstarted");
    });

    it('동시에 여러 task를 시작하면 "User Busy"를 throw해야 함', async function () {
      // given
      const newTaskData: Parameters<typeof taskRepo.insert>[1] = {
        user_id: testUserData.id,
        content: "sample content",
        deadline: "2023-11-12",
      };
      const taskId1 = await taskRepo.insert(knex, newTaskData);
      const taskId2 = await taskRepo.insert(knex, newTaskData);

      // when
      await taskRepo.updateProgress(knex, { id: taskId1, progress: "doing" });

      // then
      return expect(
        taskRepo.updateProgress(knex, { id: taskId2, progress: "doing" })
      ).to.eventually.be.rejectedWith(HttpError, "User Busy");
    });

    it("생성한 task는 content를 수정 가능해야 함", async function () {
      // given
      const newTaskData: Parameters<typeof taskRepo.insert>[1] = {
        user_id: testUserData.id,
        content: "sample content",
        deadline: "2023-11-12",
      };
      const taskId = await taskRepo.insert(knex, newTaskData);

      // when
      const updatedContent = "updated content";
      await taskRepo.updateContent(knex, {
        id: taskId,
        content: updatedContent,
      });

      // then
      return expect(taskRepo.findById(knex, taskId)).to.eventually.deep.include(
        {
          content: updatedContent,
        }
      );
    });
  });
});
