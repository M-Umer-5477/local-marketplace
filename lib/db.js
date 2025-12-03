import mongoose from 'mongoose';

const MONGODB_URL = process.env.MONGODB_URL;

if (!MONGODB_URL) {
  throw new Error('Please define the MONGODB_URL environment variable inside .env.local');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connect() {
  // 1. If we are already connected, return the existing connection
  if (cached.conn) {
    return cached.conn;
  }

  // 2. If a connection is in progress, return the existing promise
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URL, opts).then((mongoose) => {
      return mongoose;
    });
  }

  // 3. Await the promise and save the connection
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

// You rarely need to manually disconnect in Next.js/Serverless
const db = { connect };

export default db;
// import mongoose from 'mongoose';

// const connection = {};

// async function connect() {
//     try {
//         if (connection.isConnected) {
//             return;
//         }
//         if (mongoose.connections.length > 0) {
//             connection.isConnected = mongoose.connections[0].readyState;
//             if (connection.isConnected === 1) {
//                 return;
//             }
//             await mongoose.disconnect();
//         }
//         const db = await mongoose.connect(process.env.MONGODB_URL);
//         connection.isConnected = db.connections[0].readyState;
//     } catch (error) {
//         console.error('Database connection error:', error);
//         throw new Error('Failed to connect to the database');
//     }
// }

// async function disconnect() {
//     try {
//         if (connection.isConnected) {
//             if (process.env.NODE_ENV === 'production') {
//                 await mongoose.disconnect();
//                 connection.isConnected = false;
//             }
//         }
//     } catch (error) {
//         console.error('Database disconnection error:', error);
//         throw new Error('Failed to disconnect from the database');
//     }
// }

// const db = { connect, disconnect };

// export default db;