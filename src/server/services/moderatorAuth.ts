import { context, reddit } from '@devvit/web/server';

import type {
  AuthorizationDiagnostics,
  AuthorizationStatus,
  SafeActorContext,
} from '../../shared/types';

type EnvLike = Partial<Pick<
  NodeJS.ProcessEnv,
  'NODE_ENV' | 'QUEUE_SENTINEL_ALLOW_LOCAL_MUTATIONS'
>>;

export interface ModeratorActorLookup {
  actor: SafeActorContext | null;
  isModerator: boolean;
}

export interface MutationAuthorization {
  allowed: boolean;
  actor: SafeActorContext | null;
  status: AuthorizationStatus;
  message: string;
}

export interface ModeratorAuthService {
  guardMutation(): Promise<MutationAuthorization>;
  getDiagnostics(): Promise<AuthorizationDiagnostics>;
}

const safeHash = (value: string) => {
  let hash = 2166136261;

  for (const char of value) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0).toString(36);
};

const localActor = (): SafeActorContext => ({
  source: 'local-bypass',
  actorKey: 'local-test',
});

const unavailableActor = (): SafeActorContext => ({
  source: 'unavailable',
});

const isLocalBypassEnabled = (env: EnvLike) =>
  env.NODE_ENV === 'test' ||
  env.QUEUE_SENTINEL_ALLOW_LOCAL_MUTATIONS === 'true';

const deniedMessage =
  'Moderator authorization is required for this Queue Sentinel mutation.';

const readDevvitActor = async (): Promise<ModeratorActorLookup | null> => {
  try {
    const subredditName = context.subredditName;
    const userId = context.userId ? String(context.userId) : '';

    if (!subredditName || !userId) {
      return null;
    }

    const currentUser = await reddit.getCurrentUser();

    if (!currentUser) {
      return {
        actor: {
          source: 'devvit-context',
          actorKey: `user-${safeHash(userId)}`,
          subredditKey: `subreddit-${safeHash(subredditName.toLowerCase())}`,
        },
        isModerator: false,
      };
    }

    const permissions =
      await currentUser.getModPermissionsForSubreddit(subredditName);

    return {
      actor: {
        source: 'devvit-context',
        actorKey: `user-${safeHash(userId)}`,
        subredditKey: `subreddit-${safeHash(subredditName.toLowerCase())}`,
      },
      isModerator: permissions.length > 0,
    };
  } catch {
    return null;
  }
};

export const createModeratorAuth = (
  env: EnvLike = process.env,
  actorLookup: () => Promise<ModeratorActorLookup | null> = readDevvitActor,
): ModeratorAuthService => {
  const resolveAuthorization = async (): Promise<MutationAuthorization> => {
    if (isLocalBypassEnabled(env)) {
      return {
        allowed: true,
        actor: localActor(),
        status: 'local-bypass',
        message: 'Local mutation bypass is active.',
      };
    }

    const lookup = await actorLookup();

    if (lookup?.isModerator) {
      return {
        allowed: true,
        actor: lookup.actor,
        status: 'allowed',
        message: 'Moderator authorization confirmed.',
      };
    }

    return {
      allowed: false,
      actor: lookup?.actor ?? unavailableActor(),
      status: lookup ? 'denied' : 'unavailable',
      message: deniedMessage,
    };
  };

  return {
    async guardMutation() {
      return await resolveAuthorization();
    },

    async getDiagnostics() {
      const authorization = await resolveAuthorization();

      return {
        mode: isLocalBypassEnabled(env)
          ? 'local-bypass'
          : authorization.status === 'unavailable'
            ? 'unavailable'
            : 'moderator-required',
        status: authorization.status,
        mutationsAllowed: authorization.allowed,
        actor: authorization.actor,
        message: authorization.message,
      };
    },
  };
};
