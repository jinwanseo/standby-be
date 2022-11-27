import client from "../../client.js";
import { protectUserResolver } from "../user.utils.js";

export default {
  Query: {
    checkCount: protectUserResolver(
      async (_, { storeId }, { loggedInUser }) => {
        try {
          const searchedStandBy = await client.standBy.findUnique({
            where: {
              userId_storeId: {
                userId: loggedInUser.id,
                storeId,
              },
            },
            select: {
              createdAt: true,
            },
          });

          if (!searchedStandBy)
            throw new Error(
              "대기 정보 없음 (스토어측 대기 취소 처리 OR 스토어 아이디 삭제)"
            );

          const waitingCount = await client.standBy.count({
            where: {
              storeId,
              state: "wait",
              createdAt: {
                lt: searchedStandBy.createdAt,
              },
            },
          });

          return {
            ok: true,
            count: waitingCount,
          };
        } catch (err) {
          return {
            ok: false,
            error: err.message,
          };
        }
      }
    ),
  },
};
