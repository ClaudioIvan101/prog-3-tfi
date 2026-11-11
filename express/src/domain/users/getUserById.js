import { publicUser } from './createUser.js';

export function makeGetUserById({ userRepository }) {
  return async (id) => publicUser(await userRepository.findById(id));
}
