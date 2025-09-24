// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type mongoose from 'mongoose';

declare global {
  var mongoose: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  } | undefined;
}