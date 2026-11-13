import { publicUser } from './createUser.js';

export function makeListUsers({ userRepository }) {
  return async () => (await userRepository.list()).map(publicUser);
}
