import { queryKeys } from "./constants";

export const generateUserKey = (userId: number, userToken: string) => {
  // query key에 userToken을 담게 되면 사용자 정보를 업데이트 후 토큰이 변경되기 때문에
  // 변경된 user정보에 대한 캐시 데이터를 업데이트 하더라도 그 과정에서 쓰이는 key는 이전의 key임.
  // Key가 동일해야 setQueryData를 했을 때 상태가 바로 적용됨

  return [queryKeys.user, userId];
  // return [queryKeys.user, userId, userToken];
};

export const generateUserAppointmentsKey = (userId: number, userToken: string) => {
  return [queryKeys.appointments, queryKeys.user, userId, userToken];
};
