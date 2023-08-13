import { pool, userModel, type UserDAO } from "model";

export const genUserService = (userDAO: UserDAO) => ({
  async signIn(id: string, password: string) {
    const connection = await pool.getConnection();

    try {
      const user = await userDAO.find(connection, id);
      await userModel.checkPassword(user, password);
      const token = userModel.makeToken(user);

      return token;
    } finally {
      connection.release();
    }
  },
  async signUp(id: string, password: string) {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      const hashed_password = await userModel.hashPassword(password);
      await userDAO.register(connection, { id, hashed_password });
      const createdUser = await userDAO.find(connection, id);

      connection.commit();
      return createdUser;
    } catch (err) {
      connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  },
});
