import { describe, expect, test, jest, beforeEach } from '@jest/globals';
import { getUserConfig, checkTokenRequestValidity } from '../functions/webhook';
import { GHPatrolConfig } from '../utils/gh-patrol-config';
import { PersonalAccessTokenRequestCreatedEvent } from '../utils/webhooks-types-extra';

describe('getUserConfig', () => {
  test('it should return the user config if the sender login is included in the config users', async () => {
    const configs : GHPatrolConfig[] = [
      { users: ['user1', 'user2'] } ,
      { users: ['user3', 'user4'] },
    ];
    const senderLogin = 'user2';

    const result = await getUserConfig(configs, senderLogin);

    expect(result).toEqual({ users: ['user1', 'user2']});
  });

  test('it should return the user config if "all" is included in the config users', async () => {
    const configs = [
      { users: ['user1', 'user2'] },
      { users: ['all'] },
    ];
    const senderLogin = 'user3';

    const result = await getUserConfig(configs, senderLogin);

    expect(result).toEqual({ users: ['all'] });
  });

  test('it should return undefined if the sender login is not included in any config users', async () => {
    const configs = [
      { users: ['user1', 'user2'] },
      { users: ['user3', 'user4'] },
    ];
    const senderLogin = 'user5';

    const result = await getUserConfig(configs, senderLogin);

    expect(result).toBeUndefined();
  });
});

describe('checkTokenRequestValidity', () => {
  beforeEach(() => {
    jest.setSystemTime(new Date('2024-05-01T00:00:00Z'));
  });
  test('it should return true if the token request expiration date is under the max duration', () => {
    const patRequest = {
      personal_access_token_request: {
        token_expires_at: '2024-05-10T00:00:00Z'
      }
    };
    const config = {
      max_duration: 30 
    };

    const result = checkTokenRequestValidity(patRequest as unknown as PersonalAccessTokenRequestCreatedEvent, config);

    expect(result).toBe(true);
  });

  test('it should return true if the token request expiration date equals the max duration', () => {
    const patRequest = {
      personal_access_token_request: {
        token_expires_at: '2024-05-02T00:00:00Z'
      }
    };
    const config = {
      max_duration: 1 
    };

    const result = checkTokenRequestValidity(patRequest as unknown as PersonalAccessTokenRequestCreatedEvent, config);

    expect(result).toBe(true);
  });

  test('it should return false if the token request expiration date is after the max duration', () => {
    const patRequest = {
      personal_access_token_request: {
        token_expires_at: '2024-06-01T00:00:00Z'
      }
    };
    const config = {
      max_duration: 10 
    };

    const result = checkTokenRequestValidity(patRequest as unknown as PersonalAccessTokenRequestCreatedEvent, config);

    expect(result).toBe(false);
  });
});