import mongoose from 'mongoose';

const connection = {};

async function connect() {
    try {
        if (connection.isConnected) {
            return;
        }
        if (mongoose.connections.length > 0) {
            connection.isConnected = mongoose.connections[0].readyState;
            if (connection.isConnected === 1) {
                return;
            }
            await mongoose.disconnect();
        }
        const db = await mongoose.connect(process.env.MONGODB_URL);
        connection.isConnected = db.connections[0].readyState;
    } catch (error) {
        console.error('Database connection error:', error);
        throw new Error('Failed to connect to the database');
    }
}

async function disconnect() {
    try {
        if (connection.isConnected) {
            if (process.env.NODE_ENV === 'production') {
                await mongoose.disconnect();
                connection.isConnected = false;
            }
        }
    } catch (error) {
        console.error('Database disconnection error:', error);
        throw new Error('Failed to disconnect from the database');
    }
}

const db = { connect, disconnect };

export default db;